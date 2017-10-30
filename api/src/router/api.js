const express = require('express')
const expressJwt = require('express-jwt')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const query = require('../query')
const util = require('../util')

const router = express.Router()

router.use(cors({
  origin: process.env.TARGET_ORIGIN
}))

router.use(expressJwt({
  secret: process.env.JWT_SECRET
}))

router.use(bodyParser.json())

/**
 * @api {get} /api/user/ 로그인한 사용자 정보를 요청
 * @apiName GetLoginUser
 * @apiGroup User
 *
 * @apiParam (login) {Number} id 로그인한 사용자의 unique ID.
 *
 * @apiSuccess {Number} id 로그인한 사용자의 id.
 * @apiSuccess {String} email 로그인한 사용자의 email.
 * @apiSuccess {String} username 로그인한 사용자의 username.
 * @apiSuccess {String} avatar 로그인한 사용자의 avatar url.
 * @apiSuccess {String} status 로그인한 사용자의 status message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "email": "example@encore.com",
 *       "username": "Encore Admin",
 *       "avatar": "https://lh3.googleusercontent.com/photo.jpg?sz=50",
 *       "status": "Happy!"
 *     }
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.get('/user', (req, res) => {
  query.getUserById(req.user.id)
    .then(user => {
      res.status(200).send({
        id: req.user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar_url,
        status: user.status_message
      })
    })
})

/**
 * @api {patch} /api/user/ 로그인한 사용자 정보를 수정
 * @apiName UpdateLoginUser
 * @apiGroup User
 *
 * @apiParam (login) {Number} id 로그인한 사용자의 unique ID.
 * @apiParam {String} [username] 로그인한 사용자의 수정할 username.
 * @apiParam {Stirng} [status_message] 로그인한 사용자의 수정할 status message.
 *
 * @apiSuccess {Object} user 수정 완료된 사용자의 개인정보.
 * @apiSuccess {Number} user.id 수정 완료된 사용자의 id.
 * @apiSuccess {String} user.email 수정 완료된 사용자의 email.
 * @apiSuccess {String} user.username 수정 완료된 사용자의 username.
 * @apiSuccess {String} user.avatar_url 수정 완료된 사용자의 avatar url.
 * @apiSuccess {String} user.status_message 수정 완료된 사용자의 status message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "user": {
 *          "id": 1,
 *          "email": "example@encore.com",
 *          "username": "Encore Admin",
 *          "avatar_url": "https://lh3.googleusercontent.com/photo.jpg?sz=50",
 *          "status_message": "Happy!"
 *        }
 *     }
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 */
router.patch('/user', (req, res) => {
  const id = req.user.id
  const username = req.body.username
  const status_message = req.body.status_message
  query.updateUserById({id, username, status_message})
    .then(user => {
      res.status(200).send({user})
    })
})

/**
 * @api {get} /api/user/:id 사용자 정보를 요청
 * @apiName GetUserById
 * @apiGroup User
 *
 * @apiParam {Number} id 정보를 조회할 사용자의 unique ID.
 *
 * @apiSuccess {Object} user 요청한 사용자의 개인정보.
 * @apiSuccess {Number} user.id 요청한 사용자의 id.
 * @apiSuccess {String} user.email 요청한 사용자의 email.
 * @apiSuccess {String} user.username 요청한 사용자의 username.
 * @apiSuccess {String} user.avatar_url 요청한 사용자의 avatar url.
 * @apiSuccess {String} user.status_message 요청한 사용자의 status message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "user": {
 *          "id": 1,
 *          "email": "example@encore.com",
 *          "username": "Encore Admin",
 *          "avatar_url": "https://lh3.googleusercontent.com/photo.jpg?sz=50",
 *          "status_message": "Happy!"
 *        }
 *     }
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 */
router.get('/user/:id', (req, res) => {
  query.getUserById(req.params.id)
    .then(user => {
      res.status(200).send({user})
    })
})

/**
 * @api {get} /api/post/ 전체 게시물 조회(TimeLine)
 * @apiName GetWholePost
 * @apiGroup Post
 * 
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 *
 * @apiSuccess {Object[]} All 조회한 게시물의 전체 정보.
 * @apiSuccess {Object[]} Post 게시물에 대한 정보.
 * @apiSuccess {Object[]} Comment 댓글에 대한 정보.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      [Post],
 *      [Comment]
 *     ]
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.get('/post', (req, res) => {
  const user_id = req.user.id
  const post = query.getWholePost(user_id)
  const comment = query.getWholeComment()
  Promise.all([post, comment]).then(data => {
    res.status(200).send(data)
  }, reject => {
    console.log('reject')
  }) 
})

/**
 * @api {get} /api/user/:id/post 특정 사용자의 게시물 조회(Feed)
 * @apiName GetPostByUserId
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 정보를 조회할 사용자의 unique ID.
 *
 * @apiSuccess {Object[]} All 조회한 게시물의 전체 정보.
 * @apiSuccess {Object[]} Post 게시물에 대한 정보.
 * @apiSuccess {Object[]} Comment 댓글에 대한 정보.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      [Post],
 *      [Comment]
 *     ]
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.get('/user/:id/post', (req, res) => {
  const id = req.params.id
  const user_id = req.user.id
  const post = query.getPostByUserId({id, user_id})
  const comment = query.getCommentByUserId(id)
  Promise.all([post, comment]).then(data => { 
    res.status(200).send(data)
  }, reject => {
    console.log('reject')
  })
})

/**
 * @api {get} /api/post/:id 개별 게시물과 게시물에 대한 코멘트 조회
 * @apiName GetPostById
 * @apiGroup Post
 *
 * @apiParam (login) {Number} id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 정보를 조회할 게시물의 unique ID.
 *
 * @apiSuccess {Object[]} All 조회한 게시물의 전체 정보.
 * @apiSuccess {Object} Post 게시물에 대한 정보.
 * @apiSuccess {Object[]} Comment 댓글에 대한 정보.
 * @apiSuccess {Object} Like 좋아요에 대한 정보.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {Post},
 *      [Comment],
 *      {Like}
 *     ]
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.get('/post/:id', (req, res) => {
  const user_id = req.user.id
  const post_id = req.params.id
  const post = query.getPostById(post_id)
  const comment = query.getCommentByPostId(post_id)
  const liked = query.getLikedState(user_id, post_id)
  Promise.all([post, comment, liked]).then(data => {
    if (data[2] != null) {
      data[0].likedState = true
    } else data[0].likedState = false
    res.status(200).send(data)
  }, reject => {
    console.log(reject)
  })
})

/**
 * @api {get} /api/post/:id/comment 게시물에 대한 코멘트 조회
 * @apiName GetCommentById
 * @apiGroup Post
 *
 * @apiParam {Number} id 정보를 조회할 게시물의 unique ID.
 *
 * @apiSuccess {Object[]} Comment 조회한 게시물에 대한 전체 코멘트.
 * @apiSuccess {Number} Comment.id 코멘트의 unique id.
 * @apiSuccess {Number} Comment.target_id 코멘트를 소유하고 있는 게시물의 unique id.
 * @apiSuccess {Number} Comment.user_id 코멘트를 작성한 사용자의 unique id.
 * @apiSuccess {String} Comment.username 코멘트를 작성한 사용자의 username.
 * @apiSuccess {String} Comment.avatar_url 코멘트를 작성한 사용자의 avatar_url.
 * @apiSuccess {String} Comment.comment 코멘트 내용.
 * @apiSuccess {Date} Comment.date 코멘트 작성일자.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *        {
 *          "id": 5,
 *          "target_id": 4,
 *          "user_id": 1,
 *          "username": "kong",
 *          "avatar_url: "https://imgfactory/image1.png",
 *          "comment": "comment_1",
 *          "date": "2017-10-24T03:34:45.000Z"
 *        },
 *        {
 *          ...
 *        }
 *     ]
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.get('/post/:id/comment', (req, res) => {
  query.getCommentByPostId(req.params.id)
    .then(comment => {
      res.status(200).send(comment)
    })
})

/**
 * @api {post} /api/post 게시물 작성
 * @apiName WritePost
 * @apiGroup Post
 *
 * @apiParam (login) {Number} id 로그인한 사용자의 unique ID.
 * @apiParam {String} picture_small 작은 앨범자켓.
 * @apiParam {String} picture_big 큰 앨범자켓.
 * @apiParam {String} preview Mp3 파일의 경로.
 * @apiParam {String} article 게시글의 내용.
 * @apiParam {String} album 앨범이름.
 * @apiParam {String} track 곡 제목.
 * @apiParam {String} artist 아티스트명.
 * @apiParam {Number} geo_x 게시글 등록 위치의 x값.
 * @apiParam {Number} geo_y 게시글 등록 위치의 y값.
 * @apiParam {String} address 게시글 등록 위치의 주소.
 *
 * @apiSuccess {Number} id 작성한 게시물의 unique ID.
 * @apiSuccess {Number} user_id 작성자의 unique id.
 * @apiSuccess {String} picture_small 작은 앨범자켓.
 * @apiSuccess {String} picture_big 큰 앨범자켓.
 * @apiSuccess {String} preview Mp3 파일의 경로.
 * @apiSuccess {String} article 작성한 게시글의 내용.
 * @apiSuccess {String} album 앨범이름.
 * @apiSuccess {String} track 곡 제목.
 * @apiSuccess {String} artist 아티스트명.
 * @apiSuccess {Number} geo_x 게시글 등록 위치의 x값.
 * @apiSuccess {Number} geo_y 게시글 등록 위치의 y값.
 * @apiSuccess {String} address 게시글 등록 위치의 주소.
 * @apiSuccess {Date} date 게시글 작성일자.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "id": 2,
 *       "user_id": 3,
 *       "picture_small": "https://api.deezer.com/album/50368392/image",
 *       "picture_big": "https://e-cdns-images.dzcdn.net/images/cover/ac4e124fa125688b31b8b8bf9f79b95b/1000x1000-000000-80-0-0.jpg",
 *       "preview": "https://e-cdns-preview-5.dzcdn.net/stream/5e4b3f5997d8b757a952552103a1e5d5-2.mp3",
 *       "article": "write...",
 *       "album": "Bugatti Raww",
 *       "track": "Nigga Wit Money",
 *       "artist": "Tyga",
 *       "geo_x": 33,
 *       "geo_y": 127,
 *       "address": "서울시 강남구 신사동",
 *       "date": "2017-10-24T10:24:58.000Z",
 *     }    
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     } 
 */
router.post('/post', (req, res) => {
  const user_id = req.user.id
  const {
    picture_small, picture_big, preview, article,
    album, track, artist, geo_x, geo_y, address} = req.body
  query.createPost({
    user_id, picture_small, picture_big, preview, article,
    album, track, artist, geo_x, geo_y, address})
    .then(post => {
      res.status(201).send(post)
    })
})

/**
 * @api {patch} /api/post/:id 게시물 수정
 * @apiName UpdatePost
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 수정하고자 하는 게시물의 unique ID.
 * @apiParam {String} article 수정하고자 하는 게시글의 내용.
 *
 * @apiSuccess {Number} id 수정한 게시물의 unique ID.
 * @apiSuccess {Number} user_id 작성자의 unique id.
 * @apiSuccess {String} picture_small 작은 앨범자켓.
 * @apiSuccess {String} picture_big 큰 앨범자켓.
 * @apiSuccess {String} preview Mp3 파일의 경로.
 * @apiSuccess {String} article 작성한 게시글의 내용.
 * @apiSuccess {String} album 앨범이름.
 * @apiSuccess {String} track 곡 제목.
 * @apiSuccess {String} artist 아티스트명.
 * @apiSuccess {Number} geo_x 게시글 등록 위치의 x값.
 * @apiSuccess {Number} geo_y 게시글 등록 위치의 y값.
 * @apiSuccess {String} address 게시글 등록 위치의 주소.
 * @apiSuccess {Date} date 게시글 작성일자.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 2,
 *       "user_id": 3,
 *       "picture_small": "https://api.deezer.com/album/50368392/image",
 *       "picture_big": "https://e-cdns-images.dzcdn.net/images/cover/ac4e124fa125688b31b8b8bf9f79b95b/1000x1000-000000-80-0-0.jpg",
 *       "preview": "https://e-cdns-preview-5.dzcdn.net/stream/5e4b3f5997d8b757a952552103a1e5d5-2.mp3",
 *       "article": "update...",
 *       "album": "Bugatti Raww",
 *       "track": "Nigga Wit Money",
 *       "artist": "Tyga",
 *       "geo_x": 33,
 *       "geo_y": 127,
 *       "address": "서울시 강남구 신사동",
 *       "date": "2017-10-24T10:24:58.000Z",
 *     }    
 *
 * @apiError UnauthorizedError No authorization token was found.
 * @apiError ForbiddenError Forbidden user access
 * @apiError NotFoundError Request path not found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *      "error": "ForbiddenError",
 *      "message": "허가되지 않은 접근입니다.",
 *      "status": 403
 *     }
 *
 *     HTTP/1.1 404 Notfound
 *     {
 *      "error": "NotFoundError",
 *      "message": "경로를 찾을 수 없습니다."
 *      "status": 404
 *     }
 */
router.patch('/post/:id', (req, res, next) => {
  const id = req.params.id
  const article = req.body.article
  const user_id = req.user.id
  query.getPostById(id)
    .then(util.authorizeRequest(user_id))
    .then(() => {
      query.updatePostById(id, {article})
        .then(post => {
          res.status(200).send(post)
        })
    })
    .catch(next)
})

/**
 * @api {delete} /api/post/:id 게시물 삭제
 * @apiName DeletePost
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 삭제하고자 하는 게시물의 unique ID.
 *
 * @apiError UnauthorizedError No authorization token was found.
 * @apiError ForbiddenError Forbidden user access
 * @apiError NotFoundError Request path not found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *      "error": "ForbiddenError",
 *      "message": "허가되지 않은 접근입니다.",
 *      "status": 403
 *     }
 *
 *     HTTP/1.1 404 Notfound
 *     {
 *      "error": "NotFoundError",
 *      "message": "경로를 찾을 수 없습니다."
 *      "status": 404
 *     }
 */
router.delete('/post/:id', (req, res, next) => {
  const id = req.params.id
  const user_id = req.user.id
  query.getPostById(id)
    .then(util.authorizeRequest(user_id))
    .then(() => {
      query.deletePostById(id)
        .then(() => {
          res.end()
        })
    })
    .catch(next)
})

/**
 * @api {post} /api/post/:id/comment 코멘트 작성
 * @apiName WriteComment
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {String} comment 작성할 코멘트 내용.
 * @apiParam {Number} target_id 코멘트를 작성하고자 하는 게시물의 unique ID.
 *
 * @apiSuccess {Number} id 작성된 코멘트의 unique ID.
 * @apiSuccess {Number} user_id 코멘트 작성자의 unique ID.
 * @apiSuccess {Number} target_id 코멘트 작성한 게시물의 unique ID.
 * @apiSuccess {String} comment 작성한 코멘트 내용.
 * @apiSuccess {Date} date 코멘트 작성일.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "id": 22,
 *       "user_id": 3,
 *       "target_id": "1",
 *       "comment": "good",
 *       "date": "2017-10-24T10:24:58.000Z",
 *     }  
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 */
router.post('/post/:id/comment', (req, res) => {
  const target_id = req.params.id
  const comment = req.body.comment
  const user_id = req.user.id
  query.createCommentByPostId({user_id, target_id, comment})
    .then(comment => {
      res.status(201).send(comment)
    })
})

/**
 * @api {patch} /api/post/:id/comment 코멘트 수정
 * @apiName UpdateComment
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {String} comment 수정할 코멘트 내용.
 * @apiParam {Number} id 코멘트를 수정하고자 하는 게시물의 unique ID.
 *
 * @apiSuccess {Number} id 수정된 코멘트의 unique ID.
 * @apiSuccess {Number} user_id 코멘트 수정자의 unique ID.
 * @apiSuccess {Number} target_id 코멘트 수정한 게시물의 unique ID.
 * @apiSuccess {String} comment 수정한 코멘트 내용.
 * @apiSuccess {Date} date 코멘트 작성일.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 22,
 *       "user_id": 3,
 *       "target_id": "1",
 *       "comment": "patched",
 *       "date": "2017-10-24T10:24:58.000Z",
 *     }  
 *
 * @apiError UnauthorizedError No authorization token was found.
 * @apiError ForbiddenError Forbidden user access
 * @apiError NotFoundError Request path not found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *      "error": "ForbiddenError",
 *      "message": "허가되지 않은 접근입니다.",
 *      "status": 403
 *     }
 *
 *     HTTP/1.1 404 Notfound
 *     {
 *      "error": "NotFoundError",
 *      "message": "경로를 찾을 수 없습니다."
 *      "status": 404
 *     }
 */
router.patch('/post/:id/comment', (req, res, next) => {
  const id = req.params.id
  const comment = req.body.comment
  const user_id = req.user.id
  query.getCommentById(id)
    .then(util.authorizeRequest(user_id))
    .then(() => {
      query.updateCommentById(id, {comment})
        .then(comment => {
          res.status(200).send(comment)
        })
    })
    .catch(next)
})

/**
 * @api {delete} /api/post/:id/comment 코멘트 삭제
 * @apiName DeleteComment
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 코멘트를 수정하고자 하는 게시물의 unique ID.
 *
 * @apiError UnauthorizedError No authorization token was found.
 * @apiError ForbiddenError Forbidden user access
 * @apiError NotFoundError Request path not found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *      "error": "ForbiddenError",
 *      "message": "허가되지 않은 접근입니다.",
 *      "status": 403
 *     }
 *
 *     HTTP/1.1 404 Notfound
 *     {
 *      "error": "NotFoundError",
 *      "message": "경로를 찾을 수 없습니다."
 *      "status": 404
 *     }
 */
router.delete('/post/:id/comment', (req, res, next) => {
  const id = req.params.id
  const user_id = req.user.id
  query.getCommentById(id)
    .then(util.authorizeRequest(user_id))
    .then(() => {
      query.deleteCommentById(id)
        .then(() => {
          res.end()
        })
    })
    .catch(next)
})

/**
 * @api {get} /api/user/:id/liked 특정 유저가 좋아요한 게시물
 * @apiName GetLikedByUserId
 * @apiGroup Post
 *
 * @apiParam {Number} user_id 좋아요한 게시물을 조회하고자 하는 사용자의 unique ID.
 *
 * @apiSuccess {Number} post_id 좋아요한 게시물의 unique ID.
 * @apiSuccess {Number} post_user_id 게시물 작성자의 unique ID.
 * @apiSuccess {String} user_name 게시물 작성자의 user_name.
 * @apiSuccess {String} avatar_url 게시물 작성자의 avatar_url.
 * @apiSuccess {String} picture_small 작은 사진.
 * @apiSuccess {String} picture_big 큰 사진.
 * @apiSuccess {String} preview Mp3 경로
 * @apiSuccess {String} article 게시물 내용.
 * @apiSuccess {String} album 앨범정보.
 * @apiSuccess {String} track 곡 정보.
 * @apiSuccess {String} artist 아티스트 정보.
 * @apiSuccess {Number} geo_x 게시물 작성 위치의 x 좌표 값.
 * @apiSuccess {Number} geo_y 게시물 작성 위치의 y 좌표 값.
 * @apiSuccess {String} address 게시물 작성 주소.
 * @apiSuccess {Date} date 게시물 작성일.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "post_id": 2,
 *       "post_user_id": 3,
 *       "username": "Taehoon Kong",
 *       "avatar_url": "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50",
 *       "picture_small": "https://api.deezer.com/album/6604163/image",
 *       "picture_big": "https://cdns-images.dzcdn.net/images/cover/e9c6f78e4dc0f050658d353679f2e30a/1000x1000-000000-80-0-0.jpg",
 *       "preview": "https://cdns-preview-a.dzcdn.net/stream/ae1059d9fa0fd93b7c5328ee3ea3d090-1.mp3",
 *       "article": "지금 놀고있어요",
 *       "album": "Were Up All Night To Get Lucky (Daft Punk feat. Pharell Pharrell Williams, Glee Cast Cover We're)",
 *       "track": "Get Lucky (Daft Punk feat. Pharrell Williams Cover)",
 *       "artist": "GMPresents & Jocelyn Scofield",
 *       "geo_x": 37,
 *       "geo_y": 127,
 *       "address": "대한민국 경기도 평택시 오성면 창신뜰길",
 *       "date": "2017-10-27T06:07:27.000Z"
 *     } 
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }     
 */
router.get('/user/:id/liked', (req, res) => {
  const user_id = req.params.id
  query.getLikedByUserId(user_id).then(post => {
    res.status(200).send(post)
  })
})

/**
 * @api {post} /api/post/:id/like 좋아요 등록
 * @apiName CreateLike
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} target_id 좋아요 등록하고자 하는 게시물의 unique ID.
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 */
router.post('/post/:id/like', (req, res) => {
  const user_id = req.user.id
  const target_id = req.params.id
  query.createLikeById({user_id, target_id})
    .then(() => {
      res.end()
    })
})

/**
 * @api {delete} /api/post/:id/like 좋아요 해제(삭제)
 * @apiName DeleteLike
 * @apiGroup Post
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} target_id 좋아요 삭제하고자 하는 게시물의 unique ID.
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 */
router.delete('/post/:id/like', (req, res) => {
  const user_id = req.user.id
  const target_id = req.params.id
  query.deleteLikeById({user_id, target_id})
    .then(() => {
      res.end()
    })
})

/**
 * @api {get} /api/history 로그인한 사용자의 음악검색 기록 요청
 * @apiName GetHistory
 * @apiGroup Music
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 *
 * @apiSuccess {Number} id 음악 정보 검색 후 저장된 unique ID.
 * @apiSuccess {Number} user_id 음악 정보 검색한 사용자의 unique ID.
 * @apiSuccess {String} keyword 음악 정보 검색 keyword.
 * @apiSuccess {String} type 음악 정보 검색 type(artist, album, track).
 * @apiSuccess {Date} date 음악 정보 검색일자.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 2,
 *       "user_id": 3,
 *       "keyword": "Adele",
 *       "type": "track",
 *       "date": "2017-10-27T06:07:27.000Z"
 *     } 
 *
 * @apiError UnauthorizedError No authorization token was found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }     
 */
router.get('/history', (req, res) => {
  const user_id = req.user.id
  query.getSearchKeyWordByUserId({user_id})
    .then(result => {
      res.status(200).send(result)
    })
})

/**
 * @api {delete} /api/history/:id 검색 히스토리 삭제
 * @apiName DeleteHistory
 * @apiGroup Music
 *
 * @apiParam (login) {Number} user_id 로그인한 사용자의 unique ID.
 * @apiParam {Number} id 삭제하고자 하는 검색기록의 unique ID.
 *
 * @apiError UnauthorizedError No authorization token was found.
 * @apiError ForbiddenError Forbidden user access
 * @apiError NotFoundError Request path not found
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "UnauthorizedError",
 *       "message": "No authorization token was found",
 *       "status": 401
 *     }
 *
 *     HTTP/1.1 403 Forbidden
 *     {
 *      "error": "ForbiddenError",
 *      "message": "허가되지 않은 접근입니다.",
 *      "status": 403
 *     }
 *
 *     HTTP/1.1 404 Notfound
 *     {
 *      "error": "NotFoundError",
 *      "message": "경로를 찾을 수 없습니다."
 *      "status": 404
 *     }
 */
router.delete('/history/:id', (req, res, next) => {
  const id = req.params.id
  const user_id = req.user.id
  query.getSearchKeyWordById(id)
    .then(util.authorizeRequest(user_id))
    .then(() => {
      query.deleteSearchKeyWordById({id})
        .then(() => res.end())
    })
    .catch(next)
})

// artist 검색
// keyword에 artist name을 넣어주어야 한다.
router.get('/artist/:keyword', (req, res) => {
  const user_id = req.user.id
  const keyword = req.params.keyword.toLowerCase()
  const type = 'artist'
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
            artist_picture_lg: data[i].picture_xl,
            aritst_top_track: data[i].tracklist,
            type: data[i].type
          })
        }
      }
      res.status(200).send(return_result)
    })
    .then(() => {
      query.getSearchKeyWordByUserId({user_id})
        .then(result => {
          if(result.length === 10) {
            const id = result[9].id
            query.deleteSearchKeyWordById({id})
              .then(() => query.createSearchKeyWordByUserId({user_id, keyword, type}))
          } else {
            query.createSearchKeyWordByUserId({user_id, keyword, type})
          }
        })
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
            artist_picture_lg: data[i].artist.picture_xl,
            type: data[i].type
          })
        }
      }
      res.status(200).send(return_result)
    })
})

// album 검색
// keyword에 album name을 넣어주어야 한다.
router.get('/album/:keyword', (req, res) => {
  const user_id = req.user.id
  const keyword = req.params.keyword.toLowerCase()
  const type = 'album'
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
            album_picture_lg: data[i].cover_xl,
            album_tracklist: data[i].tracklist,
            type: data[i].type
          })
        }
      }
      res.status(200).send(return_result)
    })
    .then(() => {
      query.getSearchKeyWordByUserId({user_id})
        .then(result => {
          if(result.length === 10) {
            const id = result[9].id
            query.deleteSearchKeyWordById({id})
              .then(() => query.createSearchKeyWordByUserId({user_id, keyword, type}))
          } else {
            query.createSearchKeyWordByUserId({user_id, keyword, type})
          }
        })
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
      const album_artist = data.artist.name
      const album_cover_sm = data.cover
      const album_cover_lg = data.cover_xl
      const release_date = data.release_date
      for(let i = 0; i < data.tracks.data.length; i++) {
        return_result.push({
          track_id: data.tracks.data[i].id,
          track_artist: data.tracks.data[i].artist.name,
          track_name: data.tracks.data[i].title,
          track_mp3_url: data.tracks.data[i].preview,
          album_artist,
          album_cover_sm,
          album_cover_lg,
          release_date,
          type: data.tracks.data[i].type
        })
      }
      res.status(200).send(return_result)
    })
})

// track 검색
// keyword에 track name을 넣어주어야 한다.
router.get('/track/:keyword', (req, res) => {
  const user_id = req.user.id
  const keyword = req.params.keyword.toLowerCase()
  const type = 'track'
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
            track_picture_lg: data[i].album.cover_xl,
            album_id: data[i].album.id,
            album_title: data[i].album.title,
            type: data[i].type
          })
        }
      }
      res.status(200).send(return_result)
    })
    .then(() => {
      query.getSearchKeyWordByUserId({user_id})
        .then(result => {
          if(result.length === 10) {
            const id = result[9].id
            query.deleteSearchKeyWordById({id})
              .then(() => query.createSearchKeyWordByUserId({user_id, keyword, type}))
          } else {
            query.createSearchKeyWordByUserId({user_id, keyword, type})
          }
        })
    })
})

router.use(function(err, req, res, next) {
  if(err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: err.name,
      message: err.message,
      status: err.status
    })
  } else if(err instanceof util.NotFoundError) {
    res.status(404).send({
      error: err.name,
      message: err.message,
      status: err.status
    })
  } else if(err instanceof util.ForbiddenError) {
    res.status(403).send({
      error: err.name,
      message: err.message,
      status: err.status
    })
  }
})

module.exports = router
