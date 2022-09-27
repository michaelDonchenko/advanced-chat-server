import express from 'express'
import {PrismaClient} from '@prisma/client'
import verifyToken from '../middlewares/verifyToken'

const router = express.Router()
const prisma = new PrismaClient()

router.post('contact/create', () => {})
router.get('/contact/:id', () => {})
router.delete('/contact/:id', () => {})
router.post('/contact/message', () => {})

export default router
