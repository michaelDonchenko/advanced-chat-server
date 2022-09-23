import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {DecodedUser} from '../interfaces'

const jwtSecret = process.env.JWT_SECRET

const verifyToken = () => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearerHeader = req.headers['authorization']
    if (!bearerHeader) {
      return res.status(403).json({message: 'No token provided'})
    }

    const bearer = bearerHeader.split(' ')
    const token = bearer[1]

    await jwt.verify(token, jwtSecret as string, (error, decodedData) => {
      if (error) {
        return res.status(403).json({message: 'Invalid token'})
      }

      req.user = decodedData as DecodedUser
      next()
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: 'Something went wrong'})
  }
}

export default verifyToken
