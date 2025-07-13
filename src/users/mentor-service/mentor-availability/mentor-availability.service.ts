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
    mentorId: string,
  ): Promise<ApiResponse<MentorAvailability>> {
    // Check if the mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with id ${mentorId} not found`);
    }

    const { days, ...availabilityData } = createMentorAvailabilityDto;

    // Create the availability with nested days and intervals
    const availability = await this.prisma.$transaction(async (prisma) => {
      const createdAvailability = await prisma.mentorAvailability.create({
        data: {
          ...availabilityData,
          mentorId,
          days: {
            create: days.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              specificDate: day.specificDate,
              intervals: {
                create: day.intervals.map((interval) => ({
                  startTime: interval.startTime,
                  endTime: interval.endTime,
                })),
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              intervals: true,
            },
          },
        },
      });
      return createdAvailability;
    });

    return {
      success: true,
      message: 'Mentor availability created successfully',
      data: availability,
    };
  }

  async findAll(mentorId: string): Promise<ApiResponse<MentorAvailability[]>> {
    const availabilities = await this.prisma.mentorAvailability.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
      include: {
        days: {
          include: {
            intervals: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Mentor availabilities retrieved successfully',
      data: availabilities,
    };
  }

  async findOne(
    id: number,
    mentorId: string,
  ): Promise<ApiResponse<MentorAvailability>> {
    const availability = await this.prisma.mentorAvailability.findUnique({
      where: { id, mentorId },
      include: {
        days: {
          include: {
            intervals: true,
          },
        },
      },
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
    mentorId: string,
    updateMentorAvailabilityDto: UpdateMentorAvailabilityDto,
  ): Promise<ApiResponse<any>> {
    try {
      // Check if availability exists
      const existingAvailability =
        await this.prisma.mentorAvailability.findUnique({
          where: { id, mentorId },
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        });

      if (!existingAvailability) {
        throw new NotFoundException(
          `Availability with ID ${id} not found or does not belong to this mentor`,
        );
      }

      const { days, ...availabilityData } = updateMentorAvailabilityDto;

      // Update the availability
      const updatedAvailability = await this.prisma.$transaction(
        async (prisma) => {
          // Update the main availability fields
          const updated = await prisma.mentorAvailability.update({
            where: { id },
            data: availabilityData,
            include: {
              days: {
                include: {
                  intervals: true,
                },
              },
            },
          });

          // If days are provided, replace existing days and intervals
          if (days) {
            // Delete existing days and their intervals
            await prisma.mentorAvailabilityDay.deleteMany({
              where: { mentorAvailabilityId: id },
            });

            // Create new days and intervals
            await prisma.mentorAvailabilityDay.createMany({
              data: days.map((day) => ({
                mentorAvailabilityId: id,
                dayOfWeek: day.dayOfWeek,
                specificDate: day.specificDate,
              })),
            });

            // Get the newly created days
            const newDays = await prisma.mentorAvailabilityDay.findMany({
              where: { mentorAvailabilityId: id },
            });

            // Create intervals for each day
            for (const day of days) {
              const matchingDay = newDays.find(
                (d) =>
                  d.dayOfWeek === day.dayOfWeek &&
                  (d.specificDate?.toISOString() ===
                    day.specificDate?.toISOString() ||
                    (!d.specificDate && !day.specificDate)),
              );
              if (matchingDay && day.intervals) {
                await prisma.mentorAvailabilityInterval.createMany({
                  data: day.intervals.map((interval) => ({
                    mentorAvailabilityDayId: matchingDay.id,
                    startTime: interval.startTime,
                    endTime: interval.endTime,
                  })),
                });
              }
            }

            // Fetch the updated availability with new days and intervals
            return await prisma.mentorAvailability.findUnique({
              where: { id },
              include: {
                days: {
                  include: {
                    intervals: true,
                  },
                },
              },
            });
          }

          return updated;
        },
      );

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
    mentorId: string,
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

  async remove(id: number, mentorId: string): Promise<ApiResponse<void>> {
    try {
      // Check if availability exists
      const existingAvailability =
        await this.prisma.mentorAvailability.findUnique({
          where: { id, mentorId },
        });

      if (!existingAvailability) {
        throw new NotFoundException(`Availability with ID ${id} not found`);
      }

      // Delete the availability (cascades to days and intervals due to onDelete: Cascade)
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
