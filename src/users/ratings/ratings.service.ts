import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRatingsDto } from './dto/create-ratings.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { UpdateRatingsDto } from './dto/update-ratings.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    rating: CreateRatingsDto,
    userId: string,
    raterId: string,
  ): Promise<ApiResponse<any>> {
    // check if the user has already rated the item
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        userId,
        raterId,
      },
    });
    if (existingRating) {
      throw new BadRequestException(
        'you have already rated this user, update rating if you want.',
      );
    }

    // create the rating
    const createdRating = await this.prisma.rating.create({
      data: {
        ...rating,
        userId,
        raterId,
      },
    });

    if (!createdRating) {
      throw new InternalServerErrorException('failed to rate user');
    }

    return {
      success: true,
      message: 'rate created successfully',
      data: createdRating,
    };
  }

  async getAll(userId: string): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const ratings = await this.prisma.rating.findMany({
      where: { userId },
    });

    return {
      success: true,
      message: 'Ratings retrieved successfully.',
      data: ratings,
    };
  }

  async getOne(id: number, userId: string): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // check if the rating exists
    const rating = await this.prisma.rating.findUnique({
      where: { id, userId },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} is not exsits`);
    }

    return {
      success: true,
      message: 'Ratings retrieved successfully.',
      data: rating,
    };
  }

  async update(
    id: number,
    rating: UpdateRatingsDto,
    raterId: string,
  ): Promise<ApiResponse<any>> {
    // check if the rating exist
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        id,
        raterId,
      },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    // update the rating
    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: rating,
    });

    if (!updatedRating) {
      throw new InternalServerErrorException('can not update the rating');
    }

    return {
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating,
    };
  }

  async like(id: number): Promise<ApiResponse<any>> {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    try {
      await this.prisma.rating.update({
        where: { id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      throw new Error(error);
    }

    return {
      success: true,
      message: 'Rating liked successfully',
      data: null,
    };
  }

  async delete(id: number, raterId: string): Promise<ApiResponse<any>> {
    const Rating = await this.prisma.rating.findUnique({
      where: { id, raterId },
    });

    if (!Rating) {
      throw new NotFoundException('Rating not found');
    }

    const user = await this.prisma.user.update({
      where: { id: Rating.userId },
      data: {
        ratings: {
          delete: {
            id: Rating.id,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Rating deleted successfully',
    };
  }
}
