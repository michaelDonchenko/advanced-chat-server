import express from 'express'
import {PrismaClient} from '@prisma/client'
import ChatController from '../controllers/chat'

const router = express.Router()
const prisma = new PrismaClient()
const chatController = new ChatController(prisma)

router.post('/create', (req, res) => chatController.createChat(req, res))

export default router
