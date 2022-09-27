import {PrismaClient} from '@prisma/client'
import {Request, Response} from 'express'

class UserController {
  constructor(private prisma: PrismaClient) {}

  async getUser(req: Request, res: Response) {
    try {
      const {id} = req.params
      const foundUser = await this.prisma.user.findUnique({
        where: {id: +id},
        select: {id: true, username: true, photo: true, contacts: true},
      })
      if (!foundUser) {
        return res.status(404).json({message: 'User not found'})
      }

      return res.status(200).json({user: foundUser})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.prisma.user.findMany({select: {id: true, username: true, photo: true}})
      return res.status(200).json({users})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      await this.prisma.user.deleteMany()
      return res.status(200).json({message: 'All the users deleted'})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }
}

export default UserController
