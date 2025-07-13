import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExperiencesDto } from './dto/create-experiences.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateExperiencesDto } from './dto/update-experiences.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class ExperiencesService {
  constructor(private prisma: PrismaService) {}
  async addExperience(userId: string, experienceDto: CreateExperiencesDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Create the experience
    const experience = await this.prisma.experience.create({
      data: {
        ...experienceDto,
        userId,
      },
    });

    return {
      success: true,
      message: 'Experience added successfully.',
      data: experience,
    };
  }

  async getExperiences(userId: string): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const experiences = await this.prisma.experience.findMany({
      where: { userId },
    });
    return {
      success: true,
      message: 'Experiences retrieved successfully.',
      data: experiences,
    };
  }

  async getExperience(id: number, userId: string): Promise<ApiResponse<any>> {
    // check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Check if experience exists
    const experience = await this.prisma.experience.findUnique({
      where: { id, userId },
    });
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found.`);
    }
    return {
      success: true,
      message: 'Experience retrieved successfully.',
      data: experience,
    };
  }
  async updateExperience(
    id: number,
    userId: string,
    experienceDto: UpdateExperiencesDto,
  ): Promise<ApiResponse<any>> {
    // Check if experience exists
    const experience = await this.prisma.experience.findUnique({
      where: { id, userId },
    });
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found.`);
    }
    // update experience
    const updatedExperience = await this.prisma.experience.update({
      where: { id },
      data: {
        ...experienceDto,
      },
    });
    return {
      success: true,
      message: 'Experience updated successfully.',
      data: updatedExperience,
    };
  }

  async deleteExperience(
    id: number,
    userId: string,
  ): Promise<ApiResponse<any>> {
    const experience = await this.prisma.experience.findUnique({
      where: { id, userId },
    });
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found.`);
    }
    // remove experience from user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        experiences: {
          delete: { id },
        },
      },
    });
    return {
      success: true,
      message: 'Experience deleted successfully.',
      data: null,
    };
  }
}
