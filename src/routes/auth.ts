import express from 'express'
import {PrismaClient} from '@prisma/client'

import AuthController from '../controllers/auth'
import validate from '../middlewares/validate'
import {loginSchema, registerSchema} from '../validations/auth'

const router = express.Router()
const prisma = new PrismaClient()
const authController = new AuthController(prisma)

router.post('/auth/login', validate(loginSchema), (req, res) => authController.login(req, res))
router.post('/auth/register', validate(registerSchema), (req, res) => authController.register(req, res))
router.get('/auth/logout', (req, res) => authController.logout(req, res))

export default router
