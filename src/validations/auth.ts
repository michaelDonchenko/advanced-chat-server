import * as yup from 'yup'

const loginSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username is too short')
    .max(20, 'Username is too long')
    .required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password is too short')
    .max(20, 'Password is too long')
    .required('Password is required'),
})

const registerSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username is too short')
    .max(20, 'Username is too long')
    .required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password is too short')
    .max(20, 'Password is too long')
    .required('Password is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
})

export {loginSchema, registerSchema}
