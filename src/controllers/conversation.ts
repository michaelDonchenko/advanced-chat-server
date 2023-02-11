import {Request, Response} from "express";
import {PrismaClient, Conversation} from "@prisma/client";
import {generic500Error} from "../utils/constants";

class ConversationController {
  constructor(private prisma: PrismaClient) {}

  async getConversation(req: Request, res: Response) {
    try {
      const myId = req.user?.id as number;
      const conversationId = Number(req.params.id);
      if (typeof conversationId !== "number") {
        return res.status(400).json({message: "Conversation id is not a number..."});
      }

      const conversation = await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {messages: {orderBy: {createdAt: "asc"}}},
      });

      if (!conversation) {
        return res.status(404).json({message: "Could not find the conversation"});
      }

      if (!this.isMyConversation(myId, conversation)) {
        return res.status(401).json({message: "No access to this conversation"});
      }

      return res.status(200).json({conversation});
    } catch (error) {
      generic500Error(res, error);
    }
  }

  async createMessage(req: Request, res: Response) {
    try {
      const myId = req.user?.id as number;
      const {text, conversationId}: {text: string; conversationId: number} = req.body;

      const conversation = await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });

      if (!conversation) {
        return res.status(404).json({message: "Could not find the conversation"});
      }

      if (!this.isMyConversation(myId, conversation)) {
        return res.status(401).json({message: "No access to this conversation"});
      }

      const newMessage = await this.prisma.message.create({
        data: {
          from: myId,
          text,
          conversationId,
        },
      });

      return res.status(201).json({message: newMessage});
    } catch (error) {
      generic500Error(res, error);
    }
  }

  isMyConversation(id: number, conversation: Conversation) {
    return conversation.participants.includes(id);
  }
}

export default ConversationController;
