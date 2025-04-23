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
    userId: number,
    raterId: number,
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

  async update(
    id: number,
    rating: UpdateRatingsDto,
    raterId: number,
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

  async delete(id: number, raterId: number): Promise<ApiResponse<any>> {
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
