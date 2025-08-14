import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionNotesDto } from './dto/update-session-notes.dto';
import { UpdateSessionFeedbackDto } from './dto/update-session-feedback.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { SessionStatus } from '@prisma/client';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Get('available-slots/:serviceId')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Get available time slots for a service' })
  @ApiParam({
    name: 'serviceId',
    description: 'Service ID to get available slots for',
    type: Number,
  })
  async getAvailableSlots(
    @Req() req,
    @Param('serviceId') serviceId: number,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.getAvailablehSlots(serviceId, req.user.id);
  }

  @Post('request')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Request a new mentoring session' })
  @ApiBody({ type: CreateSessionDto })
  async requestSession(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.requestSession(createSessionDto, req.user.id);
  }

  @Patch(':sessionId/accept')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiOperation({ summary: 'Accept a session request' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', type: String })
  async acceptSession(
    @Param('sessionId') sessionId: string,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.acceptSession(sessionId, req.user.id);
  }

  @Patch(':sessionId/reject')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiOperation({ summary: 'Reject a session request' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', type: String })
  async rejectSession(
    @Param('sessionId') sessionId: string,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.rejectSession(sessionId, req.user.id);
  }

  @Patch(':sessionId/cancel')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', type: String })
  async cancelSession(
    @Param('sessionId') sessionId: string,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.cancelSession(sessionId, req.user.id);
  }

  @Patch(':sessionId/complete')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Mark a session as complete' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', type: String })
  async completeSession(
    @Param('sessionId') sessionId: string,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.completeSession(sessionId, req.user.id);
  }

  @Post('notes')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiOperation({ summary: 'Add notes to a completed session' })
  @ApiBody({ type: UpdateSessionNotesDto })
  async addNotes(
    @Body() updateSessionNotesDto: UpdateSessionNotesDto,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.addNotes(updateSessionNotesDto, req.user.id);
  }

  @Post('feedback')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTEE))
  @ApiOperation({ summary: 'Add feedback to a completed session' })
  @ApiBody({ type: UpdateSessionFeedbackDto })
  async addFeedback(
    @Body() updateSessionFeedbackDto: UpdateSessionFeedbackDto,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.addFeedback(
      updateSessionFeedbackDto,
      req.user.id,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: SessionStatus,
    description: 'Filter sessions by status',
  })
  async getUserSessions(@Req() req, @Query() query): Promise<ApiResponse<any>> {
    return this.sessionService.getUserSessions(req.user.id, query.filter);
  }

  @Get(':sessionId')
  @UseGuards(JwtAuthGuard, RoleGuard([Role.MENTOR, Role.MENTEE]))
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', type: String })
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.sessionService.getSession(sessionId, req.user.id);
  }
}
