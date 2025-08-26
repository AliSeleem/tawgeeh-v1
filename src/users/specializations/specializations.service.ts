import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateSpecializationCategoryDto,
  UpdateSpecializationCategoryDto,
} from './dto/specialization-category.dto';
import {
  CreateSpecializationDto,
  UpdateSpecializationDto,
} from './dto/specialization.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpecializationsService {
  constructor(private prisma: PrismaService) {}

  // === SpecializationCategory CRUD ===
  async createCategory(dto: CreateSpecializationCategoryDto) {
    return this.prisma.specializationCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.specializationCategory.findMany({
      include: { specializations: true },
    });
  }

  async findOneCategory(id: number) {
    const category = await this.prisma.specializationCategory.findUnique({
      where: { id },
      include: { specializations: true },
    });
    if (!category) {
      throw new NotFoundException(
        `Specialization category with ID ${id} not found`,
      );
    }
    return category;
  }

  async updateCategory(id: number, dto: UpdateSpecializationCategoryDto) {
    await this.findOneCategory(id); // Ensure category exists
    return this.prisma.specializationCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async deleteCategory(id: number) {
    await this.findOneCategory(id); // Ensure category exists
    return this.prisma.specializationCategory.delete({
      where: { id },
    });
  }

  // === Specialization CRUD ===
  async createSpecialization(dto: CreateSpecializationDto) {
    await this.findOneCategory(dto.categoryId); // Ensure category exists
    return this.prisma.specialization.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        description: dto.description,
      },
    });
  }

  async findAllSpecializations() {
    return this.prisma.specialization.findMany({
      include: { category: true },
    });
  }

  async findOneSpecialization(id: number) {
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${id} not found`);
    }
    return specialization;
  }

  async findSpecializationsByCategory(categoryId: number) {
    return this.prisma.specialization.findMany({
      where: { categoryId },
      include: { category: true },
    });
  }

  async updateSpecialization(id: number, dto: UpdateSpecializationDto) {
    await this.findOneSpecialization(id); // Ensure specialization exists
    const data: any = { name: dto.name, description: dto.description };
    if (dto.categoryId) {
      await this.findOneCategory(dto.categoryId); // Ensure new category exists
      data.categoryId = dto.categoryId;
    }
    return this.prisma.specialization.update({
      where: { id },
      data,
    });
  }

  async deleteSpecialization(id: number) {
    await this.findOneSpecialization(id); // Ensure specialization exists
    return this.prisma.specialization.delete({
      where: { id },
    });
  }
}
