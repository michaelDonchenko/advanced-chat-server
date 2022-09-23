export interface User {
  id: number
  email: string
  username: string
  password: string
  createdAt: Date
}

export interface Message {
  id: number
  from: number
  text: string
  createdAt: string
  chatId: number
}
