import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MentorAvailabilityService } from './mentor-availability.service';
import { CreateMentorAvailabilityDto } from './dto/create-mentor-availability.dto';
import { UpdateMentorAvailabilityDto } from './dto/update-mentor-availability.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { MentorAvailability } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';

// @ApiTags('Mentor Availability')
@Controller('mentor-availability')
// @UsePipes(new ValidationPipe({ transform: true })) // Enable DTO validation
export class MentorAvailabilityController {
  constructor(
    private readonly mentorAvailabilityService: MentorAvailabilityService,
  ) {}

  @Post('/')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create mentor availability',
    description: 'Add a new availability to the mentor profile',
  })
  @ApiBody({ type: CreateMentorAvailabilityDto })
  async create(
    @Req() Req,
    @Body() createMentorAvailabilityDto: CreateMentorAvailabilityDto,
  ): Promise<ApiResponse<MentorAvailability>> {
    return this.mentorAvailabilityService.create(
      createMentorAvailabilityDto,
      Req.user.id,
    );
  }

  @Get('/')
  @ApiOperation({
    summary: 'Get mentor availabilities',
    description: 'Retrieve all availabilities for the mentor profile',
  })
  async findAll(@Req() Req): Promise<ApiResponse<MentorAvailability[]>> {
    return this.mentorAvailabilityService.findAll(Req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get mentor availability by ID',
    description: 'Retrieve a specific availability from the mentor profile',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Availability ID',
    example: 1,
  })
  async findOne(
    @Req() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<MentorAvailability>> {
    return this.mentorAvailabilityService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update mentor availability',
    description: 'Update an existing availability in the mentor profile',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Availability ID',
    example: 1,
  })
  @ApiBody({ type: UpdateMentorAvailabilityDto })
  async update(
    @Req() Req,
    @Param('id') id: string,
    @Body() updateMentorAvailabilityDto: UpdateMentorAvailabilityDto,
  ): Promise<ApiResponse<MentorAvailability>> {
    return this.mentorAvailabilityService.update(
      +id,
      Req.user.id,
      updateMentorAvailabilityDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete mentor availability',
    description: 'Remove an availability from the mentor profile',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Availability ID',
    example: 1,
  })
  async remove(
    @Req() Req,
    @Param('id') id: string,
  ): Promise<ApiResponse<void>> {
    return this.mentorAvailabilityService.remove(+id, Req.user.id);
  }
}
