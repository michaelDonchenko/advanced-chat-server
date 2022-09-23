import {PrismaClient} from '@prisma/client'
import {Request, Response} from 'express'

class ChatController {
  constructor(private prisma: PrismaClient) {}

  async createChat(req: Request, res: Response) {
    try {
      const {userId, myId} = req.body

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

  async findAll() {}

  async findOne() {}
}

export default ChatController
