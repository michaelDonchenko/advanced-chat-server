import express from 'express'
import {PrismaClient} from '@prisma/client'

import AuthController from '../controllers/auth'
import validate from '../middlewares/validate'
import {loginSchema, registerSchema} from '../validations/auth'

const prisma = new PrismaClient()
const router = express.Router()
const authController = new AuthController(prisma)

router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res))
router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res))
router.get('/logout', (req, res) => authController.logout(req, res))

export default router
