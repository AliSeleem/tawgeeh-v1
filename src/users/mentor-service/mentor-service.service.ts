import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMentorServiceDto } from './dto/create-mentor-service.dto';
import { UpdateMentorServiceDto } from './dto/update-mentor-service.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionService } from './question/question.service';
import { MentorAvailabilityService } from './mentor-availability/mentor-availability.service';
import { MentorAvailability, MentorService } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { NewCreateMentorServiceDto } from './dto/new-create-mentor-service.dto';
import { NewUpdateMentorServiceDto } from './dto/new-update-mentor-service.dto';
import { CreateMentorAvailabilityDto } from './mentor-availability/dto/create-mentor-availability.dto';
import { NewCreateMentorAvailabilityDto } from './mentor-availability/dto/new-create-mentor-availability.dto';

@Injectable()
export class MentorServiceService {
  constructor(
    private readonly questionService: QuestionService,
    private prisma: PrismaService,
    private availabilityService: MentorAvailabilityService,
  ) {}

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
    const { questions, availabilityIds, ...mentorServiceData } =
      createMentorServiceDto;

    // Validate availability IDs
    if (availabilityIds?.length && availabilityIds?.length > 0) {
      const validAvailabilities =
        await this.availabilityService.validateAvailabilityIds(
          availabilityIds,
          mentorId,
        );
      if (validAvailabilities.length !== availabilityIds.length) {
        throw new NotFoundException(
          'One or more availability IDs are invalid or not owned by the mentor',
        );
      }
    }

    // create a new mentor service
    const mentorService = await this.prisma.mentorService.create({
      data: {
        ...mentorServiceData,
        mentorId,
        dates: {
          connect: availabilityIds?.map((id) => ({ id })) || [],
        },
      },
    });

    // Create questions in parallel
    const questionPromises =
      questions?.map((question) =>
        this.questionService.create(question, mentorService.id),
      ) || [];
    await Promise.all(questionPromises);

    // Fetch the full service with questions and availabilities
    const finalService = await this.prisma.mentorService.findUnique({
      where: { id: mentorService.id },
      include: {
        questions: true,
        dates: {
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

  async newCreate(
    mentorId: string,
    createMentorServiceDto: NewCreateMentorServiceDto,
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

    const availabilityWithTitle = {
      ...availability,
      title: mentorServiceData.name,
    };

    // create availability and get availability ID
    const createdAvailability = await this.availabilityService.create(
      availabilityWithTitle,
      mentorId,
    );

    // create a new mentor service
    const mentorService = await this.prisma.mentorService.create({
      data: {
        ...mentorServiceData,
        mentorId,
        dates: {
          connect: [createdAvailability.data?.id]?.map((id) => ({ id })) || [],
        },
      },
    });

    // Create questions in parallel
    const questionPromises =
      questions?.map((question) =>
        this.questionService.create(question, mentorService.id),
      ) || [];
    await Promise.all(questionPromises);

    // Fetch the full service with questions and availabilities
    const finalService = await this.prisma.mentorService.findUnique({
      where: { id: mentorService.id },
      include: {
        questions: true,
        dates: {
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
        dates: {
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
        dates: {
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
        dates: {
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
    // extract questions and dates
    const { availabilityIds, questions, ...serviceData } =
      updateMentorServiceDto;

    // Check if service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id, mentorId },
    });
    if (!service) {
      throw new NotFoundException(`Mentor service with ID ${id} not found`);
    }

    // Validate availability IDs if provided
    if (availabilityIds?.length && availabilityIds?.length > 0) {
      const validAvailabilities =
        await this.availabilityService.validateAvailabilityIds(
          availabilityIds,
          service.mentorId,
        );
      if (validAvailabilities.length !== availabilityIds.length) {
        throw new NotFoundException(
          'One or more availability IDs are invalid or not owned by the mentor',
        );
      }
    }

    // Update the service
    const updatedService = await this.prisma.mentorService.update({
      where: { id },
      data: {
        ...serviceData,
        dates: {
          connect: availabilityIds ? availabilityIds.map((id) => ({ id })) : [],
        },
      },
    });

    // Check for new questions and removed ones, and update questions in parallel
    if (questions) {
      // Get existing questions
      const existingQuestions = await this.prisma.question.findMany({
        where: { serviceId: id },
        select: { id: true, question: true },
      });

      // Identify questions to delete (existing but not in new list)
      const questionsToDelete = existingQuestions.filter(
        (eq) => !questions.some((q) => q.question === eq.question),
      );

      // Identify questions to create (new but not in existing list)
      const questionsToCreate = questions.filter(
        (q) => !existingQuestions.some((eq) => eq.question === q.question),
      );

      // Execute deletions and creations in parallel
      const questionPromises = [
        ...questionsToDelete.map((q) =>
          this.questionService.remove(q.id, updatedService.id),
        ),
        ...questionsToCreate.map((q) => this.questionService.create(q, id)),
      ];

      await Promise.all(questionPromises);
    }

    // Fetch the updated service with questions and availabilities
    const finalService = await this.prisma.mentorService.findUnique({
      where: { id },
      include: {
        questions: true,
        dates: {
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
      message: 'Mentor service updated successfully',
      data: finalService ?? undefined,
    };
  }

  async newUpdate(
    id: number,
    mentorId: string,
    updateMentorServiceDto: NewUpdateMentorServiceDto,
  ): Promise<ApiResponse<MentorService>> {
    // Validate inputs
    if (!id || !mentorId) {
      throw new BadRequestException('Service ID and mentor ID are required');
    }

    // Fetch existing service with relations
    const service = await this.prisma.mentorService.findUnique({
      where: { id, mentorId },
      include: {
        questions: true,
        dates: {
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

    // Extract DTO fields
    const { availability, questions, ...serviceData } = updateMentorServiceDto;

    // Use Prisma transaction to ensure atomic updates
    const updatedService = await this.prisma.$transaction(
      async (tx) => {
        // Handle availability updates
        let newAvailability: MentorAvailability | null = null;
        if (availability) {
          // Delete existing availabilities
          if (service.dates.length > 0) {
            await Promise.all(
              service.dates.map((date) =>
                this.availabilityService.remove(date.id, mentorId),
              ),
            );
          }

          // Prepare new availability with fallback values
          const availabilityWithDefaults: CreateMentorAvailabilityDto = {
            title: serviceData.name || service.name,
            availableFrom:
              availability.availableFrom ||
              (service.dates[0]?.availableFrom ?? new Date().toISOString()),
            expireAt:
              availability.expireAt || service.dates[0]?.expireAt || undefined,
            maxDaysBefore:
              availability.maxDaysBefore ||
              service.dates[0]?.maxDaysBefore ||
              30,
            minHoursBefore:
              availability.minHoursBefore ||
              service.dates[0]?.minHoursBefore ||
              24,
            maxBookingsPerDay:
              availability.maxBookingsPerDay ||
              service.dates[0]?.maxBookingsPerDay ||
              5,
            breakMinutes:
              availability.breakMinutes || service.dates[0]?.breakMinutes || 15,
            isRecurring:
              availability.isRecurring ??
              service.dates[0]?.isRecurring ??
              false,
            days: availability.days || service.dates[0]?.days || [],
          };

          newAvailability = (
            await this.availabilityService.create(
              availabilityWithDefaults,
              mentorId,
            )
          ).data!;
        } else if (service.dates.length > 0) {
          newAvailability = service.dates[0];
        }

        // Handle question updates
        if (questions) {
          // Get existing questions
          const existingQuestions = service.questions;

          // Identify questions to delete and create
          const existingQuestionSet = new Set(
            existingQuestions.map((q) => q.question),
          );
          const newQuestionSet = new Set(questions.map((q) => q.question));

          const questionsToDelete = existingQuestions.filter(
            (q) => !newQuestionSet.has(q.question),
          );
          const questionsToCreate = questions.filter(
            (q) => !existingQuestionSet.has(q.question),
          );

          // Execute question updates in parallel
          await Promise.all([
            ...questionsToDelete.map((q) =>
              this.questionService.remove(q.id, id),
            ),
            ...questionsToCreate.map((q) => this.questionService.create(q, id)),
          ]);
        }

        // Update the mentor service
        const updated = await tx.mentorService.update({
          where: { id },
          data: {
            ...serviceData,
            ...(newAvailability && {
              dates: {
                connect: { id: newAvailability.id },
              },
            }),
          },
          include: {
            questions: true,
            dates: {
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

        return updated;
      },
      { timeout: 6000 },
    );

    return {
      success: true,
      message: 'Mentor service updated successfully',
      data: updatedService,
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
      where: { id },
    });

    return {
      success: true,
      message: 'Mentor service deleted successfully',
      data: deletedService,
    };
  }
}
