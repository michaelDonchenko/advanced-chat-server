import express from "express";
import {PrismaClient} from "@prisma/client";
import {verifyToken} from "../middlewares/verifyToken";
import ConversationController from "../controllers/conversation";
import {validate} from "../middlewares/validate";
import {createMessageRequest} from "../validators";

const router = express.Router();
const prisma = new PrismaClient();
const conversationController = new ConversationController(prisma);
const baseUrl = "/conversation";

router.get(`${baseUrl}/:id`, verifyToken(), (req, res) =>
  conversationController.getConversation(req, res)
);
router.post(`${baseUrl}`, validate(createMessageRequest), verifyToken(), (req, res) =>
  conversationController.createMessage(req, res)
);

export default router;
