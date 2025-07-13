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
@Controller('userss')
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
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    example: 'John Doe',
    description: 'Search users by name or company or role in this company',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    type: String,
    example: 'Developer',
    description: 'Filter users by specialization',
  })
  async getAllUsers(
    @Query() query: { email?: string; q?: string; specialization?: string },
  ): Promise<ApiResponse<any>> {
    return this.usersService.getAllUsers(query);
  }

  @Get('explore')
  @ApiOperation({
    summary: 'Explore users',
    description: 'Retrieve a list of users for exploration purposes',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    example: 'John Doe',
    description: 'Search users by name or company or role in this company',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    type: String,
    example: 'Developer',
    description: 'Filter users by specialization',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    example: 'user@example.com',
    description: 'Filter users by email address',
  })
  async exploreUsers(@Query() query: any): Promise<ApiResponse<any>> {
    return this.usersService.explore(query);
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
      `http://168.231.114.196/uploads/${image_url.filename}`,
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
  async deleteUser(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.usersService.deleteUser(+id);
  }
}
