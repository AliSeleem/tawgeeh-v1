import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';
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
  async getProfile(@Req() req: Request): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.getUserById(req.user['id']);
  }
}
