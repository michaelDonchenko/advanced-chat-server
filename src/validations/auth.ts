import * as yup from 'yup'

const loginSchema = yup.object({
  username: yup.string().min(3, 'Username is too short').max(20, 'Username is too long').required(),
  password: yup.string().min(6, 'Password is too short').max(20, 'Password is too long').required(),
})

const registerSchema = yup.object({
  username: yup.string().min(3, 'Username is too short').max(20, 'Username is too long').required(),
  password: yup.string().min(6, 'Password is too short').max(20, 'Password is too long').required(),
})

export {loginSchema, registerSchema}
