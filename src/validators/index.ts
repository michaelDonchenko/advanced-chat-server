import * as yup from 'yup'

export const authRequest = yup.object({
  username: yup.string().min(3, 'Username is too short').max(15, 'Username is too long').required(),
  password: yup.string().min(4, 'Password is too short').max(15, 'Password is too long').required(),
})

export const createMessageRequest = yup.object({
  conversationId: yup.number().required(),
  text: yup.string().required(),
})
