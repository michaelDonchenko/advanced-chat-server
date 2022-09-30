import express from 'express'
import {PrismaClient} from '@prisma/client'
import verifyToken from '../middlewares/verifyToken'
import ContactController from '../controllers/contact'

const router = express.Router()
const prisma = new PrismaClient()
const contactController = new ContactController(prisma)

router.post('/contact/create', verifyToken(), (req, res) => contactController.createOrFind(req, res))
router.delete('/contact/delete', verifyToken(), (req, res) => contactController.createOrFind(req, res))

export default router
