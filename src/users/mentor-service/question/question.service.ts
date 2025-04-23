import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { Question } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}
  async create(
    createQuestionDto: CreateQuestionDto,
    serviceId: number,
  ): Promise<ApiResponse<Question>> {
    // check if the service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // create the question
    const question = await this.prisma.question.create({
      data: {
        ...createQuestionDto,
        serviceId,
      },
    });

    return {
      success: true,
      message: 'Question created successfully',
      data: question,
    };
  }

  async findAll(serviceId: number): Promise<ApiResponse<Question[]>> {
    // check if the service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    // get all questions
    const questions = await this.prisma.question.findMany({
      where: { serviceId },
    });
    if (!questions) {
      throw new NotFoundException('Questions not found');
    }
    return {
      success: true,
      message: 'Questions retrieved successfully',
      data: questions,
    };
  }

  async findOne(id: number, serviceId: number): Promise<ApiResponse<Question>> {
    // check if the service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    // check if the question exists
    const question = await this.prisma.question.findUnique({
      where: { id, serviceId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // return the question
    return {
      success: true,
      message: 'Question retrieved successfully',
      data: question,
    };
  }

  async update(
    id: number,
    serviceId: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<ApiResponse<Question>> {
    // check if the service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    // check if the question exists
    const question = await this.prisma.question.findUnique({
      where: { id, serviceId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // update the question
    const updatedQuestion = await this.prisma.question.update({
      where: { id, serviceId },
      data: updateQuestionDto,
    });

    return {
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion,
    };
  }

  async remove(id: number, serviceId: number): Promise<ApiResponse<Question>> {
    // check if the service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    // check if the question exists
    const question = await this.prisma.question.findUnique({
      where: { id, serviceId },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // delete the question
    await this.prisma.question.delete({
      where: { id, serviceId },
    });

    // return the response
    return {
      success: true,
      message: 'Question deleted successfully',
      data: question,
    };
  }
}
