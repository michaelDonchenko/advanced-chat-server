import * as yup from 'yup'

export const createChatSchema = yup.object({
  userId: yup.number().required(),
})

export const newMessageSchema = yup.object({
  chatId: yup.number().required(),
  text: yup.string().required(),
})
