const crypto = require('crypto')

const flashError = (req, res) => err => {
  req.flash('error', err.message)
  res.redirect(req.originalUrl)
}

const createToken = () => {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (err, buf) => {
      const token = buf.toString('hex')
      resolve(token)
    })
  })
}

const authorizeRequest = user_id => result => {
  if(!result) {
    throw new NotFoundError('경로를 찾을 수 없습니다.')
  } else if(!result.id) {
    throw new NotFoundError('경로를 찾을 수 없습니다.')
  } else if(result.user_id !== user_id) {
    throw new ForbiddenError('허가되지 않은 접근입니다.')
  } else {
    return
  }
}

class userAlreadyExists extends Error {
  constructor(message) {
    super(message)
    this.name = 'userAlreadyExist'
    this.redirectUrl ='/register'
  }
}

class emailNotExists extends Error {
  constructor(message) {
    super(message)
    this.name = 'emailNotExists'
    this.redirectUrl = '/forgot'
  }
}

class tokenInvalidExpires extends Error {
  constructor(message) {
    super(message)
    this.name = 'tokenInvalidExpires'
    this.redirectUrl = '/forgot'
  }
}

class requireField extends Error {
  constructor(message) {
    super(message)
    this.name = 'requireField'
  }
}

class registerRequire extends Error {
  constructor(message) {
    super(message)
    this.name = 'registerRequire'
    this.redirectUrl = '/register'
  }
}

class passwordResetRequire extends Error {
  constructor(message, token) {
    super(message)
    this.name = 'passwordResetRequire'
    this.redirectUrl = `/reset/${token}`
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ForbiddenError'
    this.status = 403
  }
}

module.exports = {
  flashError,
  createToken,
  authorizeRequest,
  userAlreadyExists,
  emailNotExists,
  tokenInvalidExpires,
  requireField,
  registerRequire,
  passwordResetRequire,
  NotFoundError,
  ForbiddenError
}
