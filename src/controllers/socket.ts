import {Conversation, Message, PrismaClient} from "@prisma/client";
import {Socket} from "socket.io";
import {DisconnectReason} from "socket.io/dist/socket";

const onlineUsers = new Map();
type HandshakeUserId = string | string[] | undefined;

class WebSocket {
  constructor(private socket: Socket, private prisma: PrismaClient) {}

  connection(userId: HandshakeUserId) {
    if (userId && userId !== "undefined") {
      onlineUsers.set(+userId, {socketRef: this.socket.id});
    }
  }

  disconnect(reason: DisconnectReason, userId: HandshakeUserId) {
    if (userId && userId !== "undefined") {
      onlineUsers.delete(+userId);
      this.socket.disconnect();
    }
  }

  login(userId: string) {
    onlineUsers.set(+userId, {socketRef: this.socket.id});
  }

  logout(userId: string) {
    onlineUsers.delete(+userId);
  }

  async message(message: Message, conversation: Conversation, myUserId: number) {
    // first flow of every message event
    const myUser = await this.prisma.user.findUnique({where: {id: myUserId}});
    const newMessage = await this.prisma.message.create({data: {...message}});
    const filteredMyUserId = conversation.participants.filter((id) => id !== myUserId);
    const otherUserId = filteredMyUserId[0];
    const relatedUser = await this.prisma.user.findUnique({where: {id: otherUserId}});
    const isRelatedUserOnline = onlineUsers.has(relatedUser?.id);
    const isContactExists = await this.prisma.contact.findFirst({
      where: {userId: otherUserId, username: myUser?.username},
    });

    if (!isContactExists) {
      if (!relatedUser || !myUser) {
        return;
      }

      const newContact = await this.prisma.contact.create({
        data: {
          username: myUser.username,
          photo: myUser.photo,
          conversationId: conversation.id,
          userId: relatedUser.id,
          lastMessage: {
            text: message.text,
            updatedAt: String(message.createdAt),
          },
          unreadMessages: 1,
        },
      });

      if (isRelatedUserOnline) {
        this.socket.to(onlineUsers.get(otherUserId)?.socketRef).emit("newContact", newContact);
      }
    }

    if (isContactExists) {
      const prevUnreadMessages = isContactExists.unreadMessages;
      const contactId = isContactExists.id;
      let updatedUnreadMessagesCount = prevUnreadMessages;
      const onlineUser = onlineUsers.get(otherUserId);

      if (onlineUser?.conversationId !== message.conversationId) {
        updatedUnreadMessagesCount = prevUnreadMessages + 1;
      }

      const updatedContact = await this.prisma.contact.update({
        where: {id: contactId},
        data: {
          lastMessage: {
            text: message.text,
            updatedAt: String(message.createdAt),
          },
          unreadMessages: updatedUnreadMessagesCount,
        },
      });

      if (isRelatedUserOnline) {
        this.socket.to(onlineUsers.get(otherUserId)?.socketRef).emit("newMessage", newMessage);
        this.socket
          .to(onlineUsers.get(otherUserId)?.socketRef)
          .emit("updateContactValues", updatedContact);
      }
    }

    // this flow is going to run at the end of the message event dosent matter on any condition
    // send message to myself
    this.socket.emit("selfMessage", newMessage);
    // update my contact details
    const myContact = await this.prisma.contact.findFirst({
      where: {userId: myUserId, username: relatedUser?.username},
    });

    if (!myContact) {
      return;
    }

    const myUpdatedContact = await this.prisma.contact.update({
      where: {id: myContact.id},
      data: {
        lastMessage: {
          text: message.text,
          updatedAt: String(message.createdAt),
        },
      },
    });

    this.socket.emit("updateMyContact", myUpdatedContact);
  }

  async conversationChange(conversationId: number, myUserId: number) {
    try {
      onlineUsers.set(myUserId, {
        socketRef: this.socket.id,
        conversationId: conversationId || null,
      });

      const contact = await this.prisma.contact.findFirst({
        where: {userId: myUserId, conversationId},
      });
      if (!contact) {
        return;
      }

      const updatedContact = await this.prisma.contact.update({
        where: {id: contact.id},
        data: {
          unreadMessages: 0,
        },
      });

      this.socket.emit("updateMyContact", updatedContact);
    } catch (error) {
      console.log(error);
    }
  }
}

export default WebSocket;
