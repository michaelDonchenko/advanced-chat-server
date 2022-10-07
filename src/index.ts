import http from 'http'
import express from 'express'
import cors from 'cors'
import {Server} from 'socket.io'
import dotenv from 'dotenv'
import WebSocket from './controllers/socket'
import auth from './routes/auth'
import user from './routes/user'
import contact from './routes/contact'
import conversation from './routes/conversation'
import {PrismaClient} from '@prisma/client'
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
const prisma = new PrismaClient()

io.on('connection', (socket) => {
  const webSocket = new WebSocket(socket, prisma)
  const userId = socket.handshake.query.userId
  webSocket.connection(userId)

  socket.on('login', (userId: string) => webSocket.login(userId))
  socket.on('logout', (userId: string) => webSocket.logout(userId))
  socket.on('message', ({message, conversation, myUserId}) => webSocket.message(message, conversation, myUserId))
  socket.on('disconnect', (reason) => webSocket.disconnect(reason, userId))
  socket.on('conversationChange', ({conversationId, myUserId}) =>
    webSocket.conversationChange(conversationId, myUserId)
  )
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/', [auth, user, contact, conversation])

server.listen(port, () => {
  console.log(`listening on port ${port}`)
})
