import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MentorServiceService } from './mentor-service.service';
import { CreateMentorServiceDto } from './dto/create-mentor-service.dto';
import { UpdateMentorServiceDto } from './dto/update-mentor-service.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('mentor-service')
export class MentorServiceController {
  constructor(private readonly mentorServiceService: MentorServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new mentor service',
    description: 'Create a new mentor service',
  })
  @ApiBody({
    type: CreateMentorServiceDto,
    description: 'Create a new mentor service',
  })
  async create(
    @Req() req: any,
    @Body() createMentorServiceDto: CreateMentorServiceDto,
  ) {
    return this.mentorServiceService.create(
      req.user.id,
      createMentorServiceDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all mentor services',
    description: 'Get all mentor services',
  })
  findAll(@Req() req: any) {
    return this.mentorServiceService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one mentor service',
    description: 'Get one mentor service',
  })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.mentorServiceService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a mentor service',
    description: 'Update a mentor service',
  })
  @ApiBody({
    type: UpdateMentorServiceDto,
    description: 'Update a mentor service',
  })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateMentorServiceDto: UpdateMentorServiceDto,
  ) {
    return this.mentorServiceService.update(
      req.user.id,
      +id,
      updateMentorServiceDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a mentor service',
    description: 'Remove a mentor service',
  })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.mentorServiceService.remove(req.user.id, +id);
  }
}
