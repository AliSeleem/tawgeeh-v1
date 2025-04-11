import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddExperienceDto } from './dto/add-experiences.dto';
import { UpdateExperienceDto } from './dto/update-experiences.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Register a new user account with required information',
  })
  @ApiBody({ type: CreateUserDto })
  @SwaggerApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Invalid input data format',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<any>> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve list of users with optional email filter',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    example: 'user@example.com',
    description: 'Filter users by email address',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'No users found matching criteria',
  })
  async getAllUsers(
    @Query() query: { email?: string },
  ): Promise<ApiResponse<any>> {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed user information',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.usersService.getUserById(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user details',
    description: 'Update partial or complete user information',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiBody({ type: UpdateUserDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<any>> {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently remove a user account',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User deleted successfully',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.usersService.deleteUser(+id);
  }

  @Post('/experience')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add experience to user',
    description: 'Add a new experience to the user profile',
  })
  @ApiBody({ type: AddExperienceDto })
  async addExperience(
    @Req() Req,
    @Body() AddExperienceDto: AddExperienceDto,
  ): Promise<ApiResponse<any>> {
    return this.usersService.addExperience(Req.user.id, AddExperienceDto);
  }

  @Patch('/experience/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user experience',
    description: 'Update existing experience of the user profile',
  })
  @ApiBody({ type: UpdateExperienceDto })
  async updateExperience(
    @Req() Req,
    @Param('id') id: number,
    @Body() UpdateExperienceDto: UpdateExperienceDto,
  ): Promise<ApiResponse<any>> {
    return this.usersService.updateExperience(
      id,
      Req.user.id,
      UpdateExperienceDto,
    );
  }

  @Delete('/experience/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user experience',
    description: 'Remove experience from the user profile',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Experience ID',
    example: 1,
  })
  async deleteExperience(
    @Req() Req,
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    return this.usersService.deleteExperience(+id, Req.user.id);
  }
}
