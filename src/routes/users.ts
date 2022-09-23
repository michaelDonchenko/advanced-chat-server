import express from 'express'
import {PrismaClient} from '@prisma/client'
import UsersController from '../controllers/users'
import verifyToken from '../middlewares/verifyToken'

const router = express.Router()
const prisma = new PrismaClient()
const usersController = new UsersController(prisma)

router.get('/:id', (req, res) => usersController.findOne(req, res))
router.get('/', (req, res) => usersController.findAll(req, res))
router.delete('/', (req, res) => usersController.deleteAll(req, res))
router.post(
  '/test',
  (req, res, next) => verifyToken(req, res, next),
  (req, res) => res.send({user: req.user})
)

export default router
