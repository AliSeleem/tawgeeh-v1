import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 🟢 Get all Chats
  @Get()
  @ApiOperation({
    summary: 'Get all chats',
    description: 'Retrieve list of all chat conversations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of chats retrieved successfully',
    schema: {
      example: [
        {
          id: 'chat-123',
          participants: [1, 2],
          lastMessage: 'Hello!',
          timestamp: '2024-03-20T15:00:00Z',
        },
      ],
    },
  })
  async getChats() {
    return this.chatService.getChats();
  }

  // 🟢 Create or Get a Chat
  @Post('create')
  @ApiOperation({
    summary: 'Create or get existing chat',
    description: 'Find or create a chat between two users',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user1Id: { type: 'number', example: 1 },
        user2Id: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved/created successfully',
    schema: {
      example: {
        id: 'chat-123',
        participants: [1, 2],
        createdAt: '2024-03-20T15:00:00Z',
      },
    },
  })
  async getOrCreateChat(@Body() body: { user1Id: string; user2Id: string }) {
    return this.chatService.getOrCreateChat(body.user1Id, body.user2Id);
  }

  // 🟢 Send a Message
  @Post('send')
  @ApiOperation({
    summary: 'Send message',
    description: 'Send a message in a chat',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chatId: { type: 'string', example: 'chat-123' },
        senderId: { type: 'number', example: 1 },
        content: { type: 'string', example: 'Hello there!' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      example: {
        id: 'msg-456',
        chatId: 'chat-123',
        senderId: 1,
        content: 'Hello there!',
        timestamp: '2024-03-20T15:05:00Z',
        read: false,
      },
    },
  })
  async sendMessage(
    @Body() body: { chatId: string; senderId: string; content: string },
  ) {
    return this.chatService.sendMessage(
      body.chatId,
      body.senderId,
      body.content,
    );
  }

  // 🟢 Get User's Chats
  @Get(':userId/chats')
  @ApiOperation({
    summary: 'Get user chats',
    description: 'Retrieve all chats for a specific user',
  })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'User chats retrieved successfully',
    schema: {
      example: [
        {
          id: 'chat-123',
          participants: [1, 2],
          unreadCount: 3,
          lastMessage: 'See you tomorrow!',
        },
      ],
    },
  })
  async getUserChats(@Param('userId') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  // 🟢 Get Messages for a Chat
  @Get(':chatId/messages')
  @ApiOperation({
    summary: 'Get chat messages',
    description: 'Retrieve message history for a specific chat',
  })
  @ApiParam({ name: 'chatId', type: 'string', example: 'chat-123' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages retrieved successfully',
    schema: {
      example: [
        {
          id: 'msg-456',
          senderId: 1,
          content: 'Hello!',
          timestamp: '2024-03-20T15:00:00Z',
          read: true,
        },
      ],
    },
  })
  async getChatMessages(@Param('chatId') chatId: string) {
    return this.chatService.getChatMessages(chatId);
  }

  // 🟢 Mark Messages as Read
  @Post('mark-read')
  @ApiOperation({
    summary: 'Mark messages as read',
    description: 'Mark all messages in a chat as read for a user',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chatId: { type: 'string', example: 'chat-123' },
        userId: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
    schema: {
      example: {
        success: true,
        message: '3 messages marked as read',
      },
    },
  })
  async markMessagesAsRead(@Body() body: { chatId: string; userId: string }) {
    return this.chatService.markMessagesAsRead(body.chatId, body.userId);
  }
}
