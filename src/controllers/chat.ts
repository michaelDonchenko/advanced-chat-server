import {PrismaClient} from '@prisma/client'
import {Request, Response} from 'express'
import {DecodedUser} from '../interfaces'

class ChatController {
  constructor(private prisma: PrismaClient) {}

  async createChat(req: Request, res: Response) {
    const {id: myId} = req.user as DecodedUser

    try {
      const {userId} = req.body

      const chatExists = await this.prisma.chat.findFirst({
        where: {
          participants: {
            hasEvery: [+userId, +myId],
          },
        },
      })

      if (chatExists) {
        return res.status(200).json({message: 'Chat already exists'})
      }

      const chat = await this.prisma.chat.create({
        data: {
          creatorId: +myId,
          participants: [+userId, +myId],
        },
      })

      return res.status(201).json({chat})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const {id} = req.user as DecodedUser

      const myChats = await this.prisma.chat.findMany({
        where: {
          OR: [
            {
              creatorId: id,
            },
            {
              participants: {
                has: id,
              },
            },
          ],
        },
        include: {
          Messages: {
            select: {
              text: true,
              createdAt: true,
            },
          },
        },
      })

      return res.status(200).json({chats: myChats})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const {chatId} = req.params
      const foundChat = await this.prisma.chat.findUnique({
        where: {id: +chatId},
        include: {
          Messages: true,
        },
      })

      if (!foundChat) {
        return res.status(404).json({message: 'Chat not found'})
      }

      return res.status(200).json({chat: foundChat})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async newMessage(req: Request, res: Response) {
    try {
      const {id: userId} = req.user as DecodedUser
      const {text, chatId} = req.body

      const newMessage = await this.prisma.message.create({
        data: {
          from: userId,
          text,
          chatId,
        },
      })

      return res.status(201).json({newMessage})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }
}

export default ChatController
