import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMentorAvailabilityDto } from './dto/create-mentor-availability.dto';
import { UpdateMentorAvailabilityDto } from './dto/update-mentor-availability.dto';
import { MentorAvailability } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class MentorAvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMentorAvailabilityDto: CreateMentorAvailabilityDto,
    mentorId: number,
  ): Promise<ApiResponse<MentorAvailability>> {
    // check if the user exsits
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with id ${mentorId} not found`);
    }

    // Create the availability
    const availability = await this.prisma.mentorAvailability.create({
      data: {
        ...createMentorAvailabilityDto,
        mentorId,
      },
    });

    return {
      success: true,
      message: 'Mentor availability created successfully',
      data: availability,
    };
  }

  async findAll(mentorId: number): Promise<ApiResponse<MentorAvailability[]>> {
    const availabilities = await this.prisma.mentorAvailability.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Mentor availabilities retrieved successfully',
      data: availabilities,
    };
  }

  async findOne(
    id: number,
    mentorId: number,
  ): Promise<ApiResponse<MentorAvailability>> {
    const availability = await this.prisma.mentorAvailability.findUnique({
      where: { id, mentorId },
    });

    if (!availability) {
      throw new NotFoundException(`Availability with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Mentor availability retrieved successfully',
      data: availability,
    };
  }

  async update(
    id: number,
    mentorId: number,
    updateMentorAvailabilityDto: UpdateMentorAvailabilityDto,
  ): Promise<ApiResponse<MentorAvailability>> {
    try {
      // Check if availability exists
      const existingAvailability =
        await this.prisma.mentorAvailability.findUnique({
          where: { id, mentorId },
        });

      if (!existingAvailability) {
        throw new NotFoundException(
          `Availability with ID ${id} not found or Not belog to this mentor`,
        );
      }

      // Update the availability
      const updatedAvailability = await this.prisma.mentorAvailability.update({
        where: { id },
        data: updateMentorAvailabilityDto,
      });

      return {
        success: true,
        message: 'Mentor availability updated successfully',
        data: updatedAvailability,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update availability',
        error:
          error instanceof NotFoundException ||
          error instanceof BadRequestException
            ? error.message
            : `Database error: ${error.message}`,
      };
    }
  }

  async validateAvailabilityIds(
    availabilityIds: number[],
    mentorId: number,
  ): Promise<any[]> {
    const availabilities = await this.prisma.mentorAvailability.findMany({
      where: {
        id: { in: availabilityIds },
        mentorId,
      },
      select: { id: true },
    });

    return availabilities;
  }

  async remove(id: number, mentorId: number): Promise<ApiResponse<void>> {
    try {
      // Check if availability exists
      const existingAvailability =
        await this.prisma.mentorAvailability.findUnique({
          where: { id, mentorId },
        });

      if (!existingAvailability) {
        throw new NotFoundException(`Availability with ID ${id} not found`);
      }

      // Delete the availability
      await this.prisma.mentorAvailability.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Mentor availability deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete availability',
        error:
          error instanceof NotFoundException
            ? error.message
            : `Database error: ${error.message}`,
      };
    }
  }
}
