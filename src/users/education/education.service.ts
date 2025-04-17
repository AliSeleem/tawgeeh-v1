import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}
  async addEdu(edu: CreateEducationDto, userId: number) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Create the education
    const education = await this.prisma.education.create({
      data: {
        ...edu,
        userId,
      },
    });

    // add education to user
    user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        education: {
          connect: { id: education.id },
        },
      },
    });

    return {
      success: true,
      message: 'Education added successfully.',
      data: user,
    };
  }

  async updateEdu(id: number, edu: UpdateEducationDto, userId: number) {
    // Check if education exists
    const education = await this.prisma.education.findUnique({
      where: { id, userId },
    });
    if (!education) {
      throw new NotFoundException(`Education with ID ${id} not found.`);
    }

    // update education
    const updatedEducation = await this.prisma.education.update({
      where: { id },
      data: {
        ...edu,
      },
    });

    return {
      success: true,
      message: 'Education updated successfully.',
      data: updatedEducation,
    };
  }

  async deleteEdu(id: number, userId: number) {
    const education = await this.prisma.education.findUnique({
      where: { id, userId },
    });
    if (!education) {
      throw new NotFoundException(`Education with ID ${id} not found.`);
    }

    // remove education from user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        education: {
          delete: { id },
        },
      },
    });

    return {
      success: true,
      message: 'Education deleted successfully.',
      data: null,
    };
  }
}
