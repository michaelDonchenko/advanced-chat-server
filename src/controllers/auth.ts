import {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import {PrismaClient} from '@prisma/client'
import {generic500Error} from '../utils/constants'

const jwtSecret = process.env.JWT_SECRET

class AuthController {
  constructor(private prisma: PrismaClient) {}

  async login(req: Request, res: Response) {
    try {
      const {username, password} = req.body
      const foundUser = await this.prisma.user.findUnique({where: {username}})

      if (!foundUser) {
        return res.status(400).json({message: 'Invalid credentials'})
      }

      const validPassword = await this.comparePasswords({password, hashedPassword: foundUser.password})

      if (!validPassword) {
        return res.status(400).json({message: 'Invalid credentials'})
      }

      const token = await this.generateJwt({id: foundUser.id, username: foundUser.username})
      foundUser.password = ''

      return res.status(201).json({user: foundUser, jwt: token})
    } catch (error) {
      generic500Error(res, error)
    }
  }

  async register(req: Request, res: Response) {
    try {
      const {username, password} = req.body
      const userExists = await this.prisma.user.findUnique({where: {username}})

      if (userExists) {
        return res.status(400).json({message: 'User already exists'})
      }

      const hashedPassword = await this.hashPassword(password)
      const createdUser = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          photo: this.generateRandomAvatar(),
        },
      })

      const token = await this.generateJwt({id: createdUser.id, username: createdUser.username})
      createdUser.password = ''

      return res.status(201).json({user: createdUser, jwt: token})
    } catch (error) {
      generic500Error(res, error)
    }
  }

  async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({message: 'Logged out'})
    } catch (error) {
      generic500Error(res, error)
    }
  }

  async hashPassword(password: string) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  }

  async generateJwt({id, username}: {id: number; username: string}) {
    return jwt.sign({id, username}, jwtSecret as string, {expiresIn: '86400s'})
  }

  async comparePasswords({password, hashedPassword}: {password: string; hashedPassword: string}) {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateRandomAvatar() {
    const gender = Math.round(Math.random())
    const imageNumber = Math.ceil(Math.random() * 98)

    return `https://randomuser.me/api/portraits/med/${gender === 0 ? 'men' : 'women'}/${imageNumber.toString()}.jpg`
  }
}

export default AuthController
