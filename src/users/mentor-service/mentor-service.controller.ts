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
import { Role } from 'src/common/enums/role.enum';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { NewCreateMentorServiceDto } from './dto/new-create-mentor-service.dto';

@Controller('mentor-service')
export class MentorServiceController {
  constructor(private readonly mentorServiceService: MentorServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
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
    console.log('Creating mentor service for user:', req.user.id);
    return this.mentorServiceService.create(
      req.user.id,
      createMentorServiceDto,
    );
  }

  @Post('/v2')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new mentor service',
    description: 'Create a new mentor service',
  })
  @ApiBody({
    type: NewCreateMentorServiceDto,
    description: 'Create a new mentor service',
  })
  async newCreate(
    @Req() req: any,
    @Body() createMentorServiceDto: NewCreateMentorServiceDto,
  ) {
    console.log('Creating new mentor service for user:', req.user.id);
    return this.mentorServiceService.newCreate(
      req.user.id,
      createMentorServiceDto,
    );
  }

  @Get('/copy/:id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a copy of one mentor service',
    description: 'Get a copy of one mentor service',
  })
  copy(@Param('id') id: number, @Req() req: any) {
    console.log('Copying mentor service with ID:');
    return this.mentorServiceService.copy(id, req.user.id);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get all mentor services',
    description: 'Get all mentor services',
  })
  findAll(@Param('userId') userId: string) {
    console.log('Finding all mentor services for user:', userId);
    return this.mentorServiceService.findAll(userId);
  }

  @Get(':userId/:id')
  @ApiOperation({
    summary: 'Get one mentor service',
    description: 'Get one mentor service',
  })
  findOne(@Param('id') id: number, @Param('userId') userId: string) {
    console.log('Finding mentor service with ID:', id, 'for user:', userId);
    return this.mentorServiceService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
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
    @Param('id') id: number,
    @Body() updateMentorServiceDto: UpdateMentorServiceDto,
  ) {
    console.log(
      'Updating mentor service with ID:',
      id,
      'for user:',
      req.user.id,
    );
    return this.mentorServiceService.update(
      id,
      req.user.id,
      updateMentorServiceDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a mentor service',
    description: 'Remove a mentor service',
  })
  remove(@Req() req: any, @Param('id') id: string) {
    console.log(
      'Removing mentor service with ID:',
      id,
      'for user:',
      req.user.id,
    );
    return this.mentorServiceService.remove(+id, req.user.id);
  }
}
