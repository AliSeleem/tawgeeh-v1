import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse as IApiResponse } from 'src/common/interfaces/response.interface';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a new mentoring session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        requesterId: { type: 'number', example: 1 },
        requestedId: { type: 'number', example: 2 },
        scheduledAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T15:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session requested successfully',
    schema: {
      example: {
        id: 1,
        requesterId: 1,
        requestedId: 2,
        scheduledAt: '2024-03-20T15:00:00Z',
        status: 'PENDING',
      },
    },
  })
  async requestSession(
    @Body('requesterId') requesterId: number,
    @Body('requestedId') requestedId: number,
    @Body('scheduledAt') scheduledAt: Date,
  ) {
    return this.sessionsService.requestSession(
      requesterId,
      requestedId,
      scheduledAt,
    );
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a session request' })
  @ApiParam({ name: 'id', description: 'Session ID', type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session accepted',
    schema: {
      example: {
        id: 1,
        status: 'ACCEPTED',
        updatedAt: '2024-03-20T15:05:00Z',
      },
    },
  })
  async acceptSession(
    @Param('id') sessionId: string,
    @Body('userId') requestedUserId: number,
  ) {
    return this.sessionsService.acceptSession(sessionId, requestedUserId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a session request' })
  @ApiParam({ name: 'id', description: 'Session ID', type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session rejected',
    schema: {
      example: {
        id: 1,
        status: 'REJECTED',
        updatedAt: '2024-03-20T15:05:00Z',
      },
    },
  })
  async rejectSession(
    @Param('id') sessionId: string,
    @Body('userId') requestedUserId: number,
  ) {
    return this.sessionsService.rejectSession(sessionId, requestedUserId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({
    status: 200,
    description: 'List of user sessions',
    schema: {
      example: [
        {
          id: 1,
          requesterId: 1,
          requestedId: 2,
          scheduledAt: '2024-03-20T15:00:00Z',
          status: 'PENDING',
        },
      ],
    },
  })
  async getUserSessions(@Req() req): Promise<IApiResponse<any>> {
    return this.sessionsService.userSessions(req.user.id);
  }
}
