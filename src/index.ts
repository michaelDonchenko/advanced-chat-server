import http from 'http'
import express from 'express'
import cors from 'cors'
import {Server} from 'socket.io'
import dotenv from 'dotenv'
import WebSocket from './controllers/socket'
import {Message, User} from './interfaces'
import auth from './routes/auth'
import user from './routes/user'
import contact from './routes/contact'
dotenv.config()

const app = express()
const port = process.env.PORT || '4000'
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:3000',
    credentials: true,
  },
})

io.on('connection', (socket) => {
  const webSocket = new WebSocket(socket)
  // connection managing
  webSocket.connection()
  socket.on('login', (user: User) => webSocket.login(user))
  socket.on('logout', (user: User) => webSocket.logout(user))
  socket.on('disconnect', (reason) => webSocket.disconnect(reason))

  socket.on('message', (message: Message) => webSocket.message(message))
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/', [auth, user, contact])

server.listen(port, () => {
  console.log(`listening on port ${port}`)
})
