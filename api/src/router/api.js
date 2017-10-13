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
router.get('/post', (req, res) => {
  query.getWholePost()
})

// 게시물 가져오기
router.get('/post/:id', (req, res) => {
  query.getPostById(req.post.id).then(post => {
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

// 게시물 삭제
router.delete('/p/:id', (req, res) => {
  query.getPostById(id).then(() => {
    query.detelePostById(id).then(() => res.end())
  }).catch(next)
})

module.exports = router
