import {Socket} from 'socket.io'
import {Message, User} from '../interfaces'

const onlineUsers = new Map()
const connectedSocketIds = new Set()

class WebSocket {
  constructor(private socket: Socket) {}

  connection() {
    connectedSocketIds.add(this.socket.id)
  }

  login(user: User) {
    onlineUsers.set(user.id, {socketRef: this.socket.id})
  }

  logout(user: User) {
    onlineUsers.delete(user.id)
  }

  disconnect(reason: string) {
    connectedSocketIds.delete(this.socket.id)
    this.socket.disconnect()
  }

  message(message: Message) {
    console.log(message)
  }
}

export default WebSocket
