const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
// const csurf = require('csurf')
const flash = require('connect-flash')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail')

const util = require('../util')
const query = require('../query')
const mw = require('../middleware')

const router = express.Router()

module.exports = function(io) {

  router.use(bodyParser.urlencoded({extended: false}))
  router.use(cookieSession({
    name: 'oasess',
    keys: [
      process.env.SESSION_SECRET
    ]
  }))
  router.use(flash())
  // router.use(csurf())
  router.use(mw.insertReq)
  router.use(mw.insertToken)
  router.use(function(req,res,next){
    req.io = io;
    next();
  });
  router.use(passport.initialize())
  router.use(passport.session())

  // Passport serializer & deserializser
  passport.serializeUser((user, done) => {
    done(null, `${user.email}:${user.username}`)
  })

  passport.deserializeUser((str, done) => {
    const [email, username] = str.split(':')
    query.firstOrCreateUserByProvider({email, username})
      .then(user => {
        if (user) {
          done(null, user)
        } else {
          done(new Error('해당 정보와 일치하는 사용자가 없습니다.'))
        }
      })
  })

  // Local Strategy
  passport.use(new LocalStrategy({ usernameField: 'email'},
    (username, password, done) => {
      const email = username
      query.getUserByEmail({email})
        .then(matched => {
          if(!matched) {
            done(new Error('아이디 또는 패스워드가 일치하지 않습니다.'))
          }
          else if(matched.password && bcrypt.compareSync(password, matched.password)) {
            done(null, matched)
          } else {
            done(new Error('아이디 또는 패스워드가 일치하지 않습니다.'))
          }
        })
    }))

  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value
    const google_profile_id = profile.id
    const google_access_token = accessToken
    const avatar_url = profile.photos[0] ? profile.photos[0].value : null
    const username = profile.displayName
    query.firstOrCreateUserByProvider(
      {email,
        google_profile_id,
        google_access_token,
        avatar_url,
        username}
    ).then(user => {
      done(null, user)
    }).catch(err => {
      done(err)
    })
  }))

  // Facebook Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value ? profile.emails[0].value : profile.displayName
    const facebook_profile_id = profile.id
    const facebook_access_token = accessToken
    const avatar_url = profile.photos[0] ? profile.photos[0].value : null
    const username = profile.displayName
    query.firstOrCreateUserByProvider(
      {email,
        facebook_profile_id,
        facebook_access_token,
        avatar_url,
        username}
    ).then(user => {
      done(null, user)
    }).catch(err => {
      done(err)
    })
  }))

  router.get('/', (req, res) => {
    res.render('auth.pug')
  })

  // If login success
  router.get('/success', mw.loginRequired, (req, res) => {
    const token = jwt.sign({id: req.user.id}, process.env.JWT_SECRET)
    res.render('success.pug', {
      token,
      origin: process.env.TARGET_ORIGIN
    })
  })

  // Local sign up Router
  router.post('/register', (req, res, next) => {
    const { email, username }  = req.body
    const password = bcrypt.hashSync(req.body.password, 10)

    query.getUserByEmail({email})
      .then((user) => {
        if(user && user.password) {
          return next(new util.userAlreadyExists('이미 가입되어 있는 사용자 입니다.'))
        }
        else {
          query.firstOrCreateUserByProvider({email, password, username})
            .then(() => {
              passport.authenticate('local', (err, user, info) => {
                if(err) {
                  return next(err)
                }
                if(!user) {
                  res.redirect(req.baseUrl)
                }
                req.logIn(user, err => {
                  if (err) {
                    return next(err)
                  }
                  res.redirect(req.baseUrl + '/success')
                })
              })(req, res, next)
            })
        }
      })
  })

  // Local login Router
  router.post('/local', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if(!user) {
        return next(new util.requireField('email과 비밀번호를 입력해 주세요.'))  
      }
      req.logIn(user, err => {
        if (err) {
          return next(err)
        }
        res.redirect(req.baseUrl + '/success')
      })
    })(req, res, next)
  })

  // Google Login Router
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if(!user) {
        return res.redirect(req.baseUrl)
      }
      req.logIn(user, err => {
        if (err) {
          return next(err)
        }
        res.redirect(req.baseUrl + '/success')
      })
    })(req, res, next)
  })

  // Facebook Login Router
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }))

  router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
      if (err) {
        return next(err)
      }
      if(!user) {
        return res.redirect(req.baseUrl)
      }
      req.logIn(user, err => {
        if (err) {
          return next(err)
        }
        res.redirect(req.baseUrl + '/success')
      })
    })(req, res, next)
  })

  router.get('/forgot', (req, res, next) => {
    res.render('forgot.pug', {
      user: req.user
    })
  })

  router.post('/forgot', (req, res, next) => {
    const { email } = req.body
    util.createToken()
      .then((token) => {
        const resetPasswordToken = token
        const resetPasswordExpires = Date.now() + 360000
        query.getUserByEmail({email})
          .then(user => {
            if(!user) {
              return next(new util.emailNotExists('등록되지 않은 이메일 입니다.'))
            }
            query.resetEmailToken({email, resetPasswordToken, resetPasswordExpires})
              .then(user => {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY)
                const msg = {
                  to: user.email,
                  from: 'admin@encore.com',
                  subject: 'Encore Password Reset',
                  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                }
                sgMail.send(msg, (err) => {
                  req.flash('info', '비밀번호 재설정 이메일이 ' + user.email + ' (으)로 전송되었습니다.')
                  res.redirect(req.baseUrl)
                })
              })
          })
      })
  })

  router.get('/reset/:token', (req, res, next) => {
    const resetPasswordToken = req.params.token
    query.resetEmailFindToken({resetPasswordToken})
      .then(user => {
        if(!user) {
          return next(new util.tokenInvalidExpires('토큰이 유효하지 않거나 유효기간이 지났습니다.'))
        }
        res.render('reset.pug')
      })
  })

  router.post('/reset/:token', (req, res, next) => {
    const resetPasswordToken = req.params.token
    const password = bcrypt.hashSync(req.body.password, 10)
    query.resetEmailFindToken({resetPasswordToken})
      .then(user => {
        if(!user) {
          return next(new util.tokenInvalidExpires('토큰이 유효하지 않거나 유효기간이 지났습니다.'))
        }
        const {email} = user
        query.resetUserEmail({email, password})
          .then(user => {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            const msg = {
              to: user.email,
              from: 'admin@encore.com',
              subject: 'Encore Password Reset Success',
              text: 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            }
            sgMail.send(msg, (err) => {
              const message = `${user.email} 의 비밀번호가 성공적으로 변경되었습니다.`
              req.io.sockets.emit('test', {message});
              req.flash('success', user.email + ' 의 비밀번호가 성공적으로 변경되었습니다.')
              res.redirect(req.baseUrl + '/reset/' + resetPasswordToken + '/complete')
            })
          })
      })
  })

  router.get('/reset/:token/complete', (req, res, next) => {
    res.render('resetComplete.pug')
  })

  io.sockets.on('connection', socket => {
    let roomId;
    const socket_id = socket.id
    console.log(`SOCKET_ID:(${socket_id}) connected`)

    // join 이벤트
    // 해당 소켓을 room에 연결시킨다.
    // 클라이언트에 username을 보낸다.
    // 유저가 접속했다는 사실을 다른 모든 유저에게 전송한다.
    socket.on('join', (data, ack) => {
      roomId = data.id
      socket.join(roomId)
      socket.broadcast.to(roomId).emit('browser connected', {socket_id})
      ack({socket_id})
    })

    socket.on('reset_now', (data, ack) => {
      const message = data.message
      socket.broadcast.to(roomId).emit('reset_complete', {message})
      ack({ok: true})
    })
  })

  // Error Handling
  router.use((err, req, res, next) => {
    req.flash('error', err.message)
    res.redirect(`${req.baseUrl}${err.redirectUrl ? err.redirectUrl : ''}`)
  })

  return router
}
