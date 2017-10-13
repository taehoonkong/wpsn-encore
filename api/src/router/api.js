const express = require('express')
const expressJwt = require('express-jwt')
const bodyParser = require('body-parser')
const cors = require('cors')

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
        email: user.email,
        username: user.username,
        avatar: user.avatar_url
      })
    })
})

router.get('/message', (req, res) => {
  res.send('Hello SPA!')
})

// 전체 게시물 가져오기
router.get('/', (req, res) => {
  query.getWholePost()
})

// 게시물 가져오기
router.get('/post/:id', (req, res) => {
  query.getPostById(req.params.id).then(post => {
    res.send(post)
  })
})

// 게시물 작성
router.post('/post', (req, res) => {
  const user_id = req.user.id
  query.createPost({user_id, username, picture, preview, article, album, track, artist, geo_x, geo_y, address, like_count}).then(([id]) => {
    return query.getPostById(id)
  }).then((post) => {
    res.status(201)
    res.send(post)
  })
})

// 게시물 수정
router.patch('/post/:id/edit', (req, res) => {
  const id = req.params.id
  const article = req.body.article
  const user_id = req.user.id
  query.getPostById(id)
    .then(() => {
      query.updatePostById(id, article)
        .then(id => {
          return query.getPostById(id)
        })
        .then(post => {
          res.send(post)
        })
    })
    .catch(next)
})

// 게시물 삭제
router.delete('/post/:id', (req, res) => {
  query.getPostById(req.params.id).then(() => {
    query.detelePostById(id).then(() => res.end())
  }).catch(next)
})

// 특정 유저가 좋아요한 게시물
router.get('/user/:id/liked', (req, res) => {
  query.getLikedByUserId(req.params.id).then(post => {
    res.send(post)
  })
})

// 좋아요 등록
router.post('/post/:id/like', (req, res) => {
  query.createLikeById(req.params.id)
})

// 좋아요 해제
router.delete('/post/:id/like', (req, res) => {
  query.deleteLikeById(req.user.id, req.params.id)
})

module.exports = router
