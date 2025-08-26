import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpecializationsService } from './specializations.service';
import {
  CreateSpecializationCategoryDto,
  UpdateSpecializationCategoryDto,
} from './dto/specialization-category.dto';
import {
  CreateSpecializationDto,
  UpdateSpecializationDto,
} from './dto/specialization.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Specializations')
@Controller('specializations')
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  // === SpecializationCategory Endpoints ===
  @Post('categories')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new specialization category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() dto: CreateSpecializationCategoryDto) {
    return this.specializationsService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all specialization categories' })
  @ApiResponse({ status: 200, description: 'List of categories returned' })
  async findAllCategories() {
    return this.specializationsService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a specialization category by ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.specializationsService.findOneCategory(id);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specialization category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecializationCategoryDto,
  ) {
    return this.specializationsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a specialization category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.specializationsService.deleteCategory(id);
    return null;
  }

  // === Specialization Endpoints ===
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new specialization' })
  @ApiResponse({
    status: 201,
    description: 'Specialization created successfully',
  })
  async createSpecialization(@Body() dto: CreateSpecializationDto) {
    return this.specializationsService.createSpecialization(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all specializations' })
  @ApiResponse({ status: 200, description: 'List of specializations returned' })
  async findAllSpecializations() {
    return this.specializationsService.findAllSpecializations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specialization by ID' })
  @ApiResponse({ status: 200, description: 'Specialization found' })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async findOneSpecialization(@Param('id', ParseIntPipe) id: number) {
    return this.specializationsService.findOneSpecialization(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get specializations by category ID' })
  @ApiResponse({ status: 200, description: 'List of specializations returned' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findSpecializationsByCategory(
    @Param('categoryId', ParseIntPipe) id: number,
  ) {
    return this.specializationsService.findSpecializationsByCategory(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specialization' })
  @ApiResponse({
    status: 200,
    description: 'Specialization updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async updateSpecialization(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecializationDto,
  ) {
    return this.specializationsService.updateSpecialization(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a specialization' })
  @ApiResponse({
    status: 204,
    description: 'Specialization deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Specialization not found' })
  async deleteSpecialization(@Param('id', ParseIntPipe) id: number) {
    await this.specializationsService.deleteSpecialization(id);
    return null;
  }
}
