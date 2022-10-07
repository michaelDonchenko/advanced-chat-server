import {Conversation, PrismaClient} from '@prisma/client'
import {Request, Response} from 'express'

class ConversationController {
  constructor(private prisma: PrismaClient) {}

  async get(req: Request, res: Response) {
    try {
      const myUserId = req.user?.id as number
      const conversationId = req.params.id

      const foundConversation = await this.prisma.conversation.findUnique({
        where: {id: +conversationId},
        include: {messages: {orderBy: {createdAt: 'asc'}}},
      })

      if (!foundConversation) {
        return res.status(404).json({message: 'Could not find the conversation'})
      }

      if (!this.isMyConversation(myUserId, foundConversation)) {
        return res.status(401).json({message: 'No access to this conversation'})
      }

      return res.status(200).json({conversation: foundConversation})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async newMessage(req: Request, res: Response) {
    try {
      const myUserId = req.user?.id as number
      const conversationId = req.params.id
      const {text} = req.body

      const conversation = await this.prisma.conversation.findUnique({where: {id: +conversationId}})

      if (!conversation) {
        return res.status(404).json({message: 'Could not find the conversation'})
      }

      if (!this.isMyConversation(myUserId, conversation)) {
        return res.status(401).json({message: 'No access to this conversation'})
      }

      const newMessage = await this.prisma.message.create({
        data: {from: myUserId, text, conversationId: +conversationId},
      })

      return res.status(201).json({message: newMessage})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  isMyConversation(id: number, conversation: Conversation): boolean {
    return conversation.participants.includes(id)
  }
}

export default ConversationController
