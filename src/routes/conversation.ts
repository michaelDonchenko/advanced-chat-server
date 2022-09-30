import express from 'express'
import {PrismaClient} from '@prisma/client'
import verifyToken from '../middlewares/verifyToken'
import ConversationController from '../controllers/conversation'

const router = express.Router()
const prisma = new PrismaClient()
const conversationController = new ConversationController(prisma)

router.get('/conversation/:id', verifyToken(), (req, res) => conversationController.get(req, res))
router.post('/conversation/message/:id', verifyToken(), (req, res) => conversationController.newMessage(req, res))
router.delete('/conversation/delete', verifyToken(), (req, res) => {})

export default router
