import express from 'express'
import {PrismaClient} from '@prisma/client'
import UsersController from '../controllers/users'

const router = express.Router()
const prisma = new PrismaClient()
const usersController = new UsersController(prisma)

router.get('/:id', (req, res) => usersController.findOne(req, res))
router.get('/', (req, res) => usersController.findAll(req, res))
router.delete('/', (req, res) => usersController.deleteAll(req, res))

export default router
