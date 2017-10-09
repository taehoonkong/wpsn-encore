const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const csurf = require('csurf')
const flash = require('connect-flash')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const util = require('../util')
const query = require('../query')
const mw = require('../middleware')

const router = express.Router()

router.use(bodyParser.urlencoded({extended: false}))
router.use(cookieSession({
  name: 'oasess',
  keys: [
    process.env.SESSION_SECRET
  ]
}))
router.use(flash())
router.use(csurf())
router.use(mw.insertReq)
router.use(mw.insertToken)
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
    query.firstOrCreateUserByProvider({email})
      .then(matched => {
        if(matched && bcrypt.compareSync(password, matched.password)) {
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
  console.log(profile)
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
  const email = profile.emails[0].value
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
      if(user.email === email) {
        return next(new Error('이미 가입되어있는 유저 입니다.'))
      }
    })

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
})

// Local login Router
router.post('/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
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

// Error Handling
router.use((err, req, res, next) => {
  req.flash('error', err.message)
  res.redirect(req.baseUrl)
})

module.exports = router
