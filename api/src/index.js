require('dotenv').config()

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const httpServer = http.Server(app)
const io = socketio(httpServer)

const authRouter = require('./router/auth')(io)
const apiRouter = require('./router/api')

const PORT = process.env.PORT || 3000

app.set('view engine', 'pug')
app.set('trust proxy')

app.use(express.static(path.join(__dirname, '..', 'public')))
app.use('/auth', authRouter)
app.use('/api', apiRouter)

httpServer.listen(PORT, () => {
  console.log(`listening ${PORT}...`)
})
