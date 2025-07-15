import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the profile information of the authenticated user',
  })
  async getProfile(@Req() req: Request): Promise<ApiResponse<Express.User>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.getUserById(req.user['id']);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the profile information of the authenticated user',
  })
  async updateProfile(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
  ): Promise<ApiResponse<Express.User>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateUser(req.user['id'], body);
  }
}
