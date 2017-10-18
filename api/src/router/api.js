const express = require('express')
const expressJwt = require('express-jwt')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const query = require('../query')

const router = express.Router()

router.use((req, res, next) => {
  next()
})

router.use(bodyParser.json())
router.use(expressJwt({
  secret: process.env.JWT_SECRET
}))
router.use(cors({
  origin: process.env.TARGET_ORIGIN
}))

router.get('/user', (req, res) => {
  query.getUserById(req.user.id)
    .then(user => {
      res.send({
        id: req.user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar_url
      })
    })
})

// 전체 게시물 가져오기
router.get('/post', (req, res) => {
  query.getWholePost()
    .then(post => {
      res.send(post)
    })
})

// 특정 사용자가 작성한 게시물 전체 가져오기
router.get('/user/:id/post', (req, res) => {
  const user_id = req.params.id
  query.getPostByUserId(user_id)
    .then(post => {
      res.send(post)
    })
})

// 게시물 & 코멘트 가져오기
router.get('/post/:id', (req, res) => {
  query.getPostById(req.params.id).then(post => {
    query.getCommentByPostId(req.params.id).then(comment => {
      res.send({post, comment})
    })
  })
})

// 코멘트만 가져오기
router.get('/post/:id/comment', (req, res) => {
  query.getCommentByPostId(req.params.id).then(comment => {
    res.send(comment)
  })
})

// 게시물 작성
router.post('/post', (req, res) => {
  const user_id = 1 //req.user.id
  const {
    picture_small, picture_big, preview, article,
    album, track, artist, geo_x, geo_y, address, like_count } = req.body
  query.createPost({
    user_id, picture_small, picture_big, preview, article,
    album, track, artist, geo_x, geo_y, address, like_count})
    .then((post) => {
      res.status(201)
      res.send(post)
    })
})

// 게시물 수정
router.patch('/post/:id', (req, res) => {
  const id = req.params.id
  const article = req.body.article

  query.getPostById(id)
    .then(post => {
      query.updatePostById(post.id, {article})
        .then(() => {
          return query.getPostById(id)
        })
        .then(post => {
          res.send(post)
        })
    })
  //.catch(next)
})

// 게시물 삭제
router.delete('/post/:id', (req, res) => {
  query.getPostById(req.params.id).then((post) => {
    query.detelePostById(post.id).then(() => res.end())
  })
  //.catch(next)
})

// 코멘트 작성
router.post('/post/:id/comment', (req, res) => {
  const target_id = req.params.id
  const comment = "ah ah mic test" // req.body.comment
  const user_id = 2 // req.user.id
  query.createCommentByPostId({user_id, target_id, comment})
    .then((comment) => {
      res.status(201)
      res.send(comment)
    })
})

// 특정 유저가 좋아요한 게시물
router.get('/user/:id/liked', (req, res) => {
  query.getLikedByUserId(req.params.id).then(post => {
    res.send(post)
  })
})

// 좋아요 등록
router.post('/post/:id/like', (req, res) => {
  const user_id = req.user.id
  const target_id = req.params.id
  query.createLikeById({user_id, target_id})
    .then((post) => {
      res.status(201)
      res.send(post)
    })
})

// 좋아요 해제
router.delete('/post/:id/like', (req, res) => {
  const user_id = req.user.id
  const target_id = req.params.id
  query.deleteLikeById(user_id, target_id).then(() => res.end())
})

// Get Music Info
router.get('/music/:keyword', (req, res) => {
  const keyword = req.params.keyword
  axios.get(`https://api.deezer.com/search?q=${keyword}`)
    .then(result => {
      res.send(result.data)
    })
})

// artist 검색 
// keyword에 artist name을 넣어주어야 한다.
router.get('/artist/:keyword', (req, res) => {
  const keyword = req.params.keyword.toLowerCase()
  axios.get(`https://api.deezer.com/search/artist/autocomplete?limit=100&q=${keyword}`)
    .then(result => {
      let return_result = []
      const {data} = result.data
      const regexr = new RegExp(`\\b${keyword}\\b`)
      for(let i = 0; i < data.length; i++) {
        let target = data[i].name.toLowerCase()
        let res = regexr.test(target)
        if(res) {
          return_result.push({
            artist_id: data[i].id,
            artist_name: data[i].name,
            artist_picture_sm: data[i].picture_small,
            artist_picture_lg: data[i].picture_big,
            aritst_top_track: data[i].tracklist,
            type: data[i].type
          })
        }
      }
      res.send(return_result)
    })
})

// artist 검색 후 해당 artist가 발매한 음반을 검색 
// keyword에 artist name을 넣어주어야 한다.
router.get('/artist/album/:keyword', (req, res) => {
   const keyword = req.params.keyword.toLowerCase()
  axios.get(`https://api.deezer.com/search/album/autocomplete?limit=100&q=${keyword}`)
    .then(result => {
      let return_result = []
      const {data} = result.data
      const regexr = new RegExp(`\\b${keyword}\\b`)
      for(let i = 0; i < data.length; i++) {
        let target = data[i].artist.name.toLowerCase()
        let res = regexr.test(target)
        if(res){
          return_result.push({
            album_id: data[i].id,
            album_artist: data[i].artist.name,
            album_title: data[i].title,
            album_picture_sm: data[i].cover,
            album_picture_lg: data[i].cover_big,
            album_tracklist: data[i].tracklist,
            artist_picture_sm: data[i].artist.picture,
            artist_picture_lg: data[i].artist.picture_big,
            type: data[i].type
          })
        }
      }
      res.send(return_result)
    })
})

// album 검색 
// keyword에 album name을 넣어주어야 한다.
router.get('/album/:keyword', (req, res) => {
  const keyword = req.params.keyword.toLowerCase()
  axios.get(`https://api.deezer.com/search/album/autocomplete?limit=100&q=${keyword}`)
    .then(result => {
      let return_result = []
      const {data} = result.data
      const regexr = new RegExp(`\\b${keyword}\\b`)
      for(let i = 0; i < data.length; i++) {
        let target = data[i].title.toLowerCase()
        let res = regexr.test(target)
        if(res){
          return_result.push({
            album_id: data[i].id,
            album_artist: data[i].artist.name,
            album_title: data[i].title,
            album_picture_sm: data[i].cover,
            album_picture_lg: data[i].cover_big,
            album_tracklist: data[i].tracklist,
            type: data[i].type
          })
        }
      }
      res.send(return_result)
    })
})

// album 검색 후에 해당 album에 담겨있는 tracklist를 검색
// keyword에 album_id를 넣어주어야 한다.
router.get('/album/tracklist/:keyword', (req, res) =>{
  const keyword = req.params.keyword
  axios.get(`https://api.deezer.com/album/${keyword}`)
    .then(result => {
      let return_result = []
      const data = result.data
      const album_cover_sm = data.cover
      const album_cover_lg = data.cover_big
      const release_date = data.release_date
      for(let i = 0; i < data.tracks.data.length; i++) {
        return_result.push({
          track_id: data.tracks.data[i].id,
          track_artist: data.tracks.data[i].artist.name,
          track_name: data.tracks.data[i].title,
          track_mp3_url: data.tracks.data[i].preview,
          album_cover_sm,
          album_cover_lg,
          release_date,
          type: data.tracks.data[i].type
        })
      }
      res.send(return_result)
    })
})

// track 검색
// keyword에 track name을 넣어주어야 한다.
router.get('/track/:keyword', (req, res) => {
  const keyword = req.params.keyword.toLowerCase()
  axios.get(`https://api.deezer.com/search/track/autocomplete?limit=100&q=${keyword}`)
    .then(result => {
      let return_result = []
      const {data} = result.data
      const regexr = new RegExp(`\\b${keyword}\\b`)
      for(let i = 0; i < data.length; i++) {
        let target = data[i].title.toLowerCase()
        let res = regexr.test(target)
        if(res) {
          return_result.push({
            track_id: data[i].id,
            track_artist: data[i].artist.name,
            track_name: data[i].title,
            track_mp3_url: data[i].preview,
            track_picture_sm: data[i].album.cover,
            track_picture_lg: data[i].album.cover_big,
            album_id: data[i].album.id,
            album_title: data[i].album.title,
            type: data[i].type
          })
        }
      }
      res.send(return_result)
    })
})


module.exports = router
