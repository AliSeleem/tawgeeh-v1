import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';

@Controller('question/:serviceId')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new question',
    description: 'Create a new question for a specific service',
  })
  @ApiBody({ type: CreateQuestionDto })
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Param('serviceId') serviceId: number,
  ) {
    return this.questionService.create(createQuestionDto, serviceId);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all questions',
    description: 'Retrieve all questions for a specific service',
  })
  findAll(@Param('serviceId') serviceId: number) {
    return this.questionService.findAll(serviceId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a specific question',
    description:
      'Retrieve a specific question by its ID for a specific service',
  })
  findOne(@Param('id') id: string, @Param('serviceId') serviceId: number) {
    return this.questionService.findOne(+id, serviceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a specific question',
    description: 'Update a specific question by its ID for a specific service',
  })
  @ApiBody({ type: UpdateQuestionDto })
  update(
    @Param('id') id: string,
    @Param('serviceId') serviceId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(+id, serviceId, updateQuestionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(Role.MENTOR))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a specific question',
    description: 'Delete a specific question by its ID for a specific service',
  })
  remove(@Param('id') id: string, @Param('serviceId') serviceId: number) {
    return this.questionService.remove(+id, serviceId);
  }
}
