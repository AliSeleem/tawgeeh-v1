// src/mentor-request/mentor-request.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../common/guards/roles.guard';
import { MentorRequestService } from './mentor-request.service';
import { CreateMentorRequestDto } from './dto/create-mentor-request.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { MentorRequest, ReqStat } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { RequestStatus } from 'src/common/enums/request-status.enum';

@Controller('mentor-requests')
export class MentorRequestController {
  constructor(private readonly mentorRequestService: MentorRequestService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTEE))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a mentor request',
    description:
      'Allows a user (mentee) to submit a request to become a mentor',
  })
  @ApiBody({ type: CreateMentorRequestDto })
  async addMentorRequest(
    @Req() req: any,
    @Body() createMentorRequestDto: CreateMentorRequestDto,
  ): Promise<ApiResponse<MentorRequest>> {
    return this.mentorRequestService.createMentorRequest(
      req.user.id,
      createMentorRequestDto,
    );
  }

  @Get('/pending')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get pending mentor requests',
    description: 'Retrieve all pending mentor requests for admin review',
  })
  async getPendingRequests(): Promise<ApiResponse<MentorRequest[]>> {
    return this.mentorRequestService.getPendingRequests();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update mentor request status',
    description: 'Approve or reject a mentor request by admin',
  })
  @ApiBody({
    schema: { properties: { status: { type: RequestStatus as any } } },
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Mentor Request ID',
    example: 1,
  })
  async updateMentorRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() status: ReqStat,
  ): Promise<ApiResponse<MentorRequest>> {
    return this.mentorRequestService.updateMentorRequest(
      +id,
      status,
      req.user.id,
    );
  }
}
