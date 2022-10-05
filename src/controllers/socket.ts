import {Conversation, PrismaClient} from '@prisma/client'
import {Socket} from 'socket.io'
import {Message} from '../interfaces'

const onlineUsers = new Map()

class WebSocket {
  constructor(private socket: Socket, private prisma: PrismaClient) {}

  connection(userId: string | string[] | undefined) {
    if (userId && userId !== 'undefined') {
      onlineUsers.set(+userId, {socketRef: this.socket.id})
    }
  }

  disconnect(reason: string, userId: string | string[] | undefined) {
    if (userId && userId !== 'undefined') {
      onlineUsers.delete(+userId)
      this.socket.disconnect()
    }
  }

  login(userId: string) {
    onlineUsers.set(+userId, {socketRef: this.socket.id})
  }

  logout(userId: string) {
    onlineUsers.delete(+userId)
  }

  async message(message: Message, conversation: Conversation, myUserId: number) {
    try {
      const myUser = await this.prisma.user.findUnique({where: {id: myUserId}})
      const newMessage = await this.prisma.message.create({data: {...message}})
      const filteredMyUserId = conversation.participants.filter((id) => id !== myUserId)
      const otherUserId = filteredMyUserId[0]
      const isContactExists = await this.prisma.contact.findFirst({
        where: {userId: otherUserId, username: myUser?.username},
      })
      const relatedUser = await this.prisma.user.findUnique({where: {id: otherUserId}})
      const isRelatedUserOnline = onlineUsers.has(relatedUser?.id)

      if (!isContactExists) {
        if (!relatedUser || !myUser) {
          return
        }

        const newContact = await this.prisma.contact.create({
          data: {
            username: myUser.username,
            photo: myUser.photo,
            conversationId: conversation.id,
            userId: relatedUser.id,
          },
        })

        if (isRelatedUserOnline) {
          this.socket.to(onlineUsers.get(otherUserId)?.socketRef).emit('newContact', newContact)
        }
      }

      if (isRelatedUserOnline) {
        this.socket.to(onlineUsers.get(otherUserId)?.socketRef).emit('newMessage', newMessage)
      }

      // send message to myself
      this.socket.emit('selfMessage', newMessage)
    } catch (error) {
      console.log(error)
    }
  }
}

export default WebSocket
