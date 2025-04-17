import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateExperiencesDto } from './dto/create-experiences.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { ExperiencesService } from './experiences.service';
import { UpdateExperiencesDto } from './dto/update-experiences.dto';

@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}
  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add experience to user',
    description: 'Add a new experience to the user profile',
  })
  @ApiBody({ type: CreateExperiencesDto })
  async addExperience(
    @Req() Req,
    @Body() AddExperienceDto: CreateExperiencesDto,
  ): Promise<ApiResponse<any>> {
    return this.experiencesService.addExperience(Req.user.id, AddExperienceDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user experience',
    description: 'Update existing experience of the user profile',
  })
  @ApiBody({ type: UpdateExperiencesDto })
  async updateExperience(
    @Req() Req,
    @Param('id') id: number,
    @Body() UpdateExperienceDto: UpdateExperiencesDto,
  ): Promise<ApiResponse<any>> {
    return this.experiencesService.updateExperience(
      id,
      Req.user.id,
      UpdateExperienceDto,
    );
  }

  @Delete(':id')
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
    return this.experiencesService.deleteExperience(+id, Req.user.id);
  }
}
