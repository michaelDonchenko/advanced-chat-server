import {Request, Response} from 'express'
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import {PrismaClient} from '@prisma/client'

const jwtSecret = process.env.JWT_SECRET

class AuthController {
  constructor(private prisma: PrismaClient) {}

  async login(req: Request, res: Response) {
    try {
      const {username, password} = req.body

      const foundUser = await this.prisma.user.findFirst({
        where: {username},
      })

      if (!foundUser) {
        return res.status(400).json({message: 'Invalid credentials'})
      }

      const matchPasswords = await this.comparePasswords(password, foundUser.password)

      if (!matchPasswords) {
        return res.status(400).json({message: 'Invalid credentials'})
      }

      const token = await this.generateJWT(foundUser)
      foundUser.password = ''

      return res.status(200).json({user: foundUser, jwt: token})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async register(req: Request, res: Response) {
    try {
      const {username, password} = req.body
      const userExists = await await this.prisma.user.findUnique({where: {username}})

      if (userExists) {
        return res.status(400).json({message: 'User already exists'})
      }

      const hashedPassword = await this.hashPassword(password)
      const newUser = await this.prisma.user.create({
        data: {password: hashedPassword, username, photo: this.generateRandomAvatar()},
      })
      const token = await this.generateJWT(newUser)

      return res.status(201).json({user: newUser, jwt: token})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({message: 'Logged out'})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message: 'Something went wrong'})
    }
  }

  async hashPassword(password: string) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  async generateJWT({id, username}: {id: number; username: string}) {
    return jwt.sign({id, username}, jwtSecret as string, {expiresIn: '86400s'}) // token expires in 24h
  }

  async comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateRandomAvatar() {
    const generateGender = Math.round(Math.random())

    const generateImageNumber = Math.ceil(Math.random() * 98)

    return `https://randomuser.me/api/portraits/med/${
      generateGender === 0 ? 'men' : 'women'
    }/${generateImageNumber.toString()}.jpg`
  }
}

export default AuthController
