// src/mentor-request/mentor-request.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMentorRequestDto } from './dto/create-mentor-request.dto';
import { UpdateMentorRequestDto } from './dto/update-mentor-request.dto';
import { MentorRequest, Role } from '@prisma/client';
import { RequestStatus } from 'src/common/enums/request-status.enum';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class MentorRequestService {
  constructor(private prisma: PrismaService) {}

  async createMentorRequest(
    userId: number,
    dto: CreateMentorRequestDto,
  ): Promise<ApiResponse<MentorRequest>> {
    // check if the user is already a mentor
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: Role.MENTOR, isMentor: true },
    });
    if (user) {
      throw new UnauthorizedException('You are already a mentor');
    }

    // check if the user already has a mentor request
    const existingRequest = await this.prisma.mentorRequest.findFirst({
      where: { userId, status: RequestStatus.PENDING },
    });
    if (existingRequest) {
      throw new UnauthorizedException(
        'You already have a pending mentor request',
      );
    }

    // create a request
    const request = await this.prisma.mentorRequest.create({
      data: {
        ...dto,
        userId,
      },
    });

    return {
      success: true,
      data: request,
      message: 'Mentor request submitted successfully',
    };
  }

  async getPendingRequests(): Promise<ApiResponse<MentorRequest[]>> {
    const requests = await this.prisma.mentorRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return {
      success: true,
      data: requests,
      message: 'Pending mentor requests retrieved',
    };
  }

  async updateMentorRequest(
    requestId: number,
    dto: UpdateMentorRequestDto,
    adminId: number,
  ): Promise<ApiResponse<any>> {
    const request = await this.prisma.mentorRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Mentor request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new UnauthorizedException('Only pending requests can be updated');
    }

    const updatedRequest = await this.prisma.mentorRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    if (dto.status === RequestStatus.APPROVED) {
      await this.prisma.user.update({
        where: { id: request.userId },
        data: { role: Role.MENTOR, isMentor: true },
      });
    }

    return {
      success: true,
      data: updatedRequest,
      message: `Mentor request ${dto.status?.toLowerCase()} successfully`,
    };
  }
}
