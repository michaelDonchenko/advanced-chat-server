import express from 'express'
import {PrismaClient} from '@prisma/client'
import ChatController from '../controllers/chat'
import verifyToken from '../middlewares/verifyToken'
import validate from '../middlewares/validate'
import {createChatSchema, newMessageSchema} from '../validations/chat'

const router = express.Router()
const prisma = new PrismaClient()
const chatController = new ChatController(prisma)

router.post('/create', verifyToken(), validate(createChatSchema), (req, res) => chatController.createChat(req, res))
router.get('/find-all', verifyToken(), (req, res) => chatController.findAll(req, res))
router.get('/find-one/:chatId', verifyToken(), (req, res) => chatController.findOne(req, res))
router.post('/new-message', verifyToken(), validate(newMessageSchema), (req, res) =>
  chatController.newMessage(req, res)
)

export default router
