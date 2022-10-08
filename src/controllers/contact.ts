import {PrismaClient} from '@prisma/client'
import {Request, Response} from 'express'

class ContactController {
  constructor(private prisma: PrismaClient) {}

  async getContacts(req: Request, res: Response) {
    try {
      const myUserId = req.user?.id as number
      const contacts = await this.prisma.contact.findMany({
        where: {userId: myUserId},
        orderBy: {createdAt: 'asc'},
      })

      return res.status(200).json({contacts})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async createOrFind(req: Request, res: Response) {
    try {
      const myUserId = req.user?.id as number
      const {username} = req.body

      const relatedUser = await this.prisma.user.findFirst({where: {username}})

      if (!relatedUser) {
        return res.status(404).json({message: 'Could not find related user'})
      }

      if (relatedUser.id === myUserId) {
        return res.status(400).json({message: 'Cannot add yourself'})
      }

      const existingContact = await this.prisma.contact.findFirst({where: {userId: myUserId, username}})

      if (existingContact) {
        return res.status(400).json({message: 'Contact already exists'})
      }

      const existingConversation = await this.prisma.conversation.findFirst({
        where: {participants: {hasEvery: [myUserId, relatedUser.id]}},
      })

      if (existingConversation) {
        const newContact = await this.prisma.contact.create({
          data: {userId: myUserId, username, photo: relatedUser.photo, conversationId: existingConversation.id},
        })

        return res.status(201).json({message: 'Contact added', contact: newContact})
      }

      const newConversation = await this.prisma.conversation.create({data: {participants: [myUserId, relatedUser.id]}})

      const newContact = await this.prisma.contact.create({
        data: {userId: myUserId, username, photo: relatedUser.photo, conversationId: newConversation.id},
      })

      return res.status(201).json({message: 'Contact added', contact: newContact})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const {contactId} = req.body

      await this.prisma.contact.delete({where: {id: contactId}})

      return res.status(200).json({message: 'Contact deleted'})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }
}

export default ContactController
