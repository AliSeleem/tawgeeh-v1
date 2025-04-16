import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { User } from '@prisma/client';
import { AddExperienceDto } from './dto/add-experiences.dto';
import { UpdateExperienceDto } from './dto/update-experiences.dto';
import { AddCertDto } from './dto/add-cert.dto';
import { UpdateCertDto } from './dto/update-cert.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    // Hash password
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    // Create the user
    const user = await this.prisma.user.create({
      data: createUserDto,
    });

    return {
      success: true,
      message: 'User created successfully.',
      data: user,
    };
  }

  async getAllUsers(query: { email?: string }): Promise<ApiResponse<any>> {
    let users = await this.prisma.user.findMany({
      select: {
        certificates: true,
        email: true,
      },
    });

    if (query.email) {
      users = users.filter((user) => user.email === query.email);
    }

    return {
      success: true,
      message: 'Users retrieved successfully.',
      data: users,
    };
  }

  async getUserById(id: number): Promise<ApiResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return {
      success: true,
      message: 'User retrieved successfully.',
      data: user,
    };
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    };
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'User deleted successfully.',
        data: null,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Can not delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Experiences //
  async addExperience(userId: number, experienceDto: AddExperienceDto) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
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

    // add experience to user
    user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        experiences: {
          connect: { id: experience.id },
        },
      },
    });
    return {
      success: true,
      message: 'Experience added successfully.',
      data: user,
    };
  }

  async updateExperience(
    id: number,
    userId: number,
    experienceDto: UpdateExperienceDto,
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
    userId: number,
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

  // Certificates //
  async addCert(cert: AddCertDto, userId: number) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Create the certificate
    const certificate = await this.prisma.certificate.create({
      data: {
        ...cert,
        userId,
      },
    });

    // add certificate to user
    user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        certificates: {
          connect: { id: certificate.id },
        },
      },
    });
    return {
      success: true,
      message: 'Certificate added successfully.',
      data: user,
    };
  }

  async updateCert(id: number, cert: UpdateCertDto, userId: number) {
    // Check if certificate exists
    const certificate = await this.prisma.certificate.findUnique({
      where: { id, userId },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found.`);
    }
    // update certificate
    const updatedCertificate = await this.prisma.certificate.update({
      where: { id },
      data: {
        ...cert,
      },
    });
    return {
      success: true,
      message: 'Certificate updated successfully.',
      data: updatedCertificate,
    };
  }

  async deleteCert(id: number, userId: number): Promise<ApiResponse<any>> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: id, userId },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found.`);
    }
    // remove certificate from user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        certificates: {
          delete: { id },
        },
      },
    });
    return {
      success: true,
      message: 'Certificate deleted successfully.',
      data: null,
    };
  }
}
