import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMentorServiceDto } from './dto/create-mentor-service.dto';
import { UpdateMentorServiceDto } from './dto/update-mentor-service.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { MentorService } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import getNextWeekdayDate from 'src/common/utils';

@Injectable()
export class MentorServiceService {
  constructor(private prisma: PrismaService) {}

  async create(
    mentorId: string,
    createMentorServiceDto: CreateMentorServiceDto,
  ): Promise<ApiResponse<MentorService>> {
    // check if mentorId is valid
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, role: Role.MENTOR },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // extract questions and dates
    const { questions, availability, ...mentorServiceData } =
      createMentorServiceDto;

    // create a new mentor service
    const mentorService = await this.prisma.$transaction(async (tx) => {
      // create service
      const createdService = await tx.mentorService.create({
        data: {
          ...mentorServiceData,
          mentorId,
          questions: questions
            ? {
                create: questions.map((question) => ({
                  ...question,
                })),
              }
            : undefined,
          availability: availability
            ? {
                create: {
                  ...availability,
                  mentorId: mentorId,
                  days: {
                    create: availability.days.map((day) => ({
                      ...day,
                      // Convert specificDate to Date object if not recurring
                      specificDate: availability.isRecurring
                        ? null
                        : typeof day.dayOfWeek !== 'undefined'
                          ? getNextWeekdayDate(day.dayOfWeek)
                          : null,
                      intervals: {
                        create: day.intervals.map((interval) => ({
                          ...interval,
                        })),
                      },
                    })),
                  },
                },
              }
            : undefined,
        },
      }); // create service
      return createdService;
    });

    // Fetch the full service with questions and availabilities
    const finalService = await this.prisma.mentorService.findUnique({
      where: { id: mentorService.id },
      include: {
        questions: true,
        availability: {
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        },
      },
    });

    if (!finalService) {
      throw new InternalServerErrorException('Could not create service');
    }

    return {
      success: true,
      message: 'Mentor service created successfully',
      data: finalService,
    };
  }

  async findAll(mentorId: string): Promise<ApiResponse<MentorService[]>> {
    // Check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, role: Role.MENTOR },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }
    const services = await this.prisma.mentorService.findMany({
      where: { mentorId },
      include: {
        questions: true,
        availability: {
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Mentor services retrieved successfully',
      data: services,
    };
  }

  async findOne(
    id: number,
    mentorId: string,
  ): Promise<ApiResponse<MentorService>> {
    // check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, isMentor: true },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // Check if service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id, mentorId },
      include: {
        questions: true,
        availability: {
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Mentor service with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'Mentor service retrieved successfully',
      data: service,
    };
  }

  async copy(
    id: number,
    mentorId: string,
  ): Promise<ApiResponse<MentorService>> {
    console.log('Copying mentor service with ID:', id, 'by user:', mentorId);
    // check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, role: Role.MENTOR },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found in the database');
    }

    // Check if service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id, mentorId },
      include: {
        questions: true,
        availability: {
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Mentor service with ID ${id} not found`);
    }

    service.name = `Copy of ${service.name}`;

    return {
      success: true,
      message: 'Mentor service retrieved successfully',
      data: service,
    };
  }

  async update(
    id: number,
    mentorId: string,
    updateMentorServiceDto: UpdateMentorServiceDto,
  ): Promise<ApiResponse<MentorService>> {
    // check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, role: Role.MENTOR },
    });
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // check if service exists
    const existingService = await this.prisma.mentorService.findFirst({
      where: { id, mentorId },
    });
    if (!existingService) {
      throw new NotFoundException(`Mentor service with ID ${id} not found`);
    }

    const { questions, availability, ...serviceData } = updateMentorServiceDto;

    const updatedService = await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Delete existing questions & availability (to fully replace them)
      await tx.question.deleteMany({ where: { serviceId: id } });
      await tx.mentorAvailability.deleteMany({
        where: { mentorServiceId: id },
      });

      // 2️⃣ Update mentor service
      const service = await tx.mentorService.update({
        where: { id },
        data: {
          ...serviceData,
          questions: questions
            ? {
                create: questions.map((q) => ({
                  ...q,
                })),
              }
            : undefined,
          availability: availability
            ? {
                create: {
                  ...availability,
                  mentorId: mentorId,
                  days: {
                    create: availability.days.map((day) => ({
                      ...day,
                      specificDate: availability.isRecurring
                        ? null
                        : typeof day.dayOfWeek !== 'undefined'
                          ? getNextWeekdayDate(day.dayOfWeek)
                          : null,
                      intervals: {
                        create: day.intervals.map((interval) => ({
                          ...interval,
                        })),
                      },
                    })),
                  },
                },
              }
            : undefined,
        },
      });

      return service;
    });

    // 3️⃣ Fetch the updated service with nested relations
    const finalService = await this.prisma.mentorService.findUnique({
      where: { id: updatedService.id },
      include: {
        questions: true,
        availability: {
          include: {
            days: {
              include: {
                intervals: true,
              },
            },
          },
        },
      },
    });

    if (!finalService) {
      throw new InternalServerErrorException('Could not update service');
    }

    return {
      success: true,
      message: 'Mentor service updated successfully',
      data: finalService,
    };
  }

  async remove(
    id: number,
    mentorId: string,
  ): Promise<ApiResponse<MentorService>> {
    // Check if service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id, mentorId },
    });
    if (!service) {
      throw new NotFoundException(`Mentor service with ID ${id} not found`);
    }

    // Delete the service (cascades to questions due to Prisma schema)
    const deletedService = await this.prisma.mentorService.delete({
      where: { id, mentorId },
    });

    return {
      success: true,
      message: 'Mentor service deleted successfully',
      data: deletedService,
    };
  }
}
