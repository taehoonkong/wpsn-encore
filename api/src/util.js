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

class userAlreadyExists extends Error {
  constructor(message) {
    super(message)
    this.name = 'userAlreadyExist'
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

module.exports = {
  flashError,
  createToken,
  userAlreadyExists,
  emailNotExists,
  tokenInvalidExpires,
  requireField
}
