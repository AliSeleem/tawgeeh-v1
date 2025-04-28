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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard(Role.ADMIN))
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @Patch('profileImg/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image_url'))
  @ApiOperation({
    summary: 'Update image',
    description: 'Update user profile image',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  async updateUserImg(
    @Param('id') id: string,
    @UploadedFile() image_url: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!image_url) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateProfileImg(
      +id,
      `http://localhost:3000/uploads/${image_url.filename}`,
    );
  }

  @Patch('coverImg/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('cover_url'))
  @ApiOperation({
    summary: 'Update cover image',
    description: 'Update user cover image',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  async updateUserCover(
    @Param('id') id: string,
    @UploadedFile() cover_url: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!cover_url) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateProfileImg(
      +id,
      `http://localhost:3000/uploads/${cover_url.filename}`,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
}
