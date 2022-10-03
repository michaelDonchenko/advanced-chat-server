export interface DecodedUser {
  id: number
  username: string
  photo: string
}

declare global {
  namespace Express {
    export interface Request {
      user?: DecodedUser
    }
  }
}

export interface User {
  id: number
  photo: string
  username: string
  password: string
  createdAt: Date
}

export interface Message {
  id: number
  from: number
  text: string
  createdAt: Date
  conversationId: number
}
