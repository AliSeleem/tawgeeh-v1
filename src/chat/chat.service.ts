import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Create or Find a Chat
  async getOrCreateChat(user1Id: number, user2Id: number) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId: user1Id } } },
          { participants: { some: { userId: user2Id } } },
        ],
      },
      include: { participants: true },
    });

    if (existingChat) return existingChat;

    return await this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { user: { connect: { id: user1Id } } },
            { user: { connect: { id: user2Id } } },
          ],
        },
      },
      include: { participants: true },
    });
  }

  // 🟢 Send a Message
  async sendMessage(chatId: string, senderId: number, content: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    return await this.prisma.message.create({
      data: { chatId, senderId, content, type: 'TEXT' },
      include: { sender: true },
    });
  }

  // 🟢 Get User's Chats
  async getUserChats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    const chats = await this.prisma.chat.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          include: { user: true },
        },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chats)
      throw new InternalServerErrorException(
        "Couldn't retrive use's chats or user has now chats",
      );

    return {
      success: true,
      message: "user's chats retrivied successfully",
      data: chats,
      error: null,
    };
  }

  // 🟢 Get all Chat
  async getChats() {
    const chats = await this.prisma.chat.findMany({
      include: {
        participants: true,
      },
    });

    if (!chats)
      throw new InternalServerErrorException("Couldn't retrive chats");

    return {
      success: true,
      message: 'Chats retrived successfully',
      data: chats,
      error: null,
    };
  }

  // 🟢 Get Chat Messages
  async getChatMessages(chatId: string) {
    return await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
  }

  // 🟢 Mark Messages as Read
  async markMessagesAsRead(chatId: string, userId: number) {
    return await this.prisma.message.updateMany({
      where: { chatId, senderId: { not: userId }, read: false },
      data: { read: true },
    });
  }
}
