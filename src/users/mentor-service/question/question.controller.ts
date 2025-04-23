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

@Controller('question/:serviceId')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve all questions',
    description: 'Retrieve all questions for a specific service',
  })
  findAll(@Param('serviceId') serviceId: number) {
    return this.questionService.findAll(serviceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve a specific question',
    description:
      'Retrieve a specific question by its ID for a specific service',
  })
  findOne(@Param('id') id: string, @Param('serviceId') serviceId: number) {
    return this.questionService.findOne(+id, serviceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a specific question',
    description: 'Delete a specific question by its ID for a specific service',
  })
  remove(@Param('id') id: string, @Param('serviceId') serviceId: number) {
    return this.questionService.remove(+id, serviceId);
  }
}
