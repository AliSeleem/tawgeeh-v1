import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}
  async create(createAchievementDto: CreateAchievementDto, userId: number) {
    // check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // create the achievement
    const achievement = await this.prisma.achievement.create({
      data: {
        ...createAchievementDto,
        userId,
      },
    });

    return {
      success: true,
      message: 'Achievement added successfully.',
      data: achievement,
    };
  }

  async update(
    id: number,
    userId: number,
    updateAchievementDto: UpdateAchievementDto,
  ) {
    // Check if achievement exists
    const achievement = await this.prisma.achievement.findUnique({
      where: { id, userId },
    });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found.`);
    }
    // Update the achievement
    const updatedAchievement = await this.prisma.achievement.update({
      where: { id },
      data: {
        ...updateAchievementDto,
      },
    });
    return {
      success: true,
      message: 'Achievement updated successfully.',
      data: updatedAchievement,
    };
  }

  async remove(id: number, userId: number) {
    // Check if achievement exists
    const achievement = await this.prisma.achievement.findUnique({
      where: { id, userId },
    });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found.`);
    }
    // Delete the achievement
    const deletedAchievement = await this.prisma.achievement.delete({
      where: { id },
    });
    return {
      success: true,
      message: 'Achievement deleted successfully.',
      data: deletedAchievement,
    };
  }
}
