import {
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
import { MentorService } from '@prisma/client';
import { Role } from 'src/common/enums/role.enum';
import { NewCreateMentorServiceDto } from './dto/new-create-mentor-service.dto';

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
      include: { questions: true, dates: true },
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
            days: true,
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
      include: { questions: true, dates: true },
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
      include: { questions: true, dates: true },
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
            days: true,
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
      include: { questions: true, dates: true },
    });
    return {
      success: true,
      message: 'Mentor service updated successfully',
      data: finalService ?? undefined,
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
