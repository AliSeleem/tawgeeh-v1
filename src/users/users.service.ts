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

  async getAllUsers(query: {
    email?: string;
    q?: string;
    specialization?: string;
  }): Promise<ApiResponse<any>> {
    // Build the Prisma where clause based on the query
    const where: any = {};

    if (query.email) {
      where.email = {
        equals: query.email,
        mode: 'insensitive', // Case-insensitive email search
      };
    } else if (query.q) {
      const searchTerm = query.q.trim();
      if (searchTerm) {
        where.OR = [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive', // Case-insensitive name search
            },
          },
          {
            experiences: {
              some: {
                OR: [
                  {
                    company: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    },
                  },
                  {
                    title: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ];
      }
    } else if (query.specialization?.trim()) {
      where.specialization = {
        contains: query.specialization.trim(),
        mode: 'insensitive',
      };
    }

    // Fetch users with the filtered conditions
    const users = await this.prisma.user.findMany({
      where,
      include: {
        experiences: {
          select: {
            company: true,
            title: true,
          },
        },
      },
    });

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

  // update profile and cover picture
  async updateProfileImg(
    userId: number,
    image_url: string,
  ): Promise<ApiResponse<string>> {
    // check if the user exists
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} is not found`);
    }

    // update the image
    user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        image_url,
      },
    });

    return {
      success: true,
      message: 'User image updated successfully',
      data: image_url,
    };
  }

  async updateCoverImg(
    userId: number,
    cover_url: string,
  ): Promise<ApiResponse<string>> {
    // check if the user exists
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} is not found`);
    }

    // update the image
    user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cover_url,
      },
    });

    return {
      success: true,
      message: 'User cover image updated successfully',
      data: cover_url,
    };
  }
}
