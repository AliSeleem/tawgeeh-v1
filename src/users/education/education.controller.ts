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
import { EducationService } from './education.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CreateEducationDto } from './dto/create-education.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { UpdateEducationDto } from './dto/update-education.dto';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}
  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add education to user',
    description: 'Add a new education to the user profile',
  })
  @ApiBody({
    type: CreateEducationDto,
  })
  async addEdu(
    @Req() req,
    @Body() edu: CreateEducationDto,
  ): Promise<ApiResponse<any>> {
    return this.educationService.addEdu(edu, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "update user's education",
  })
  @ApiBody({
    type: UpdateEducationDto,
  })
  async updateEdu(
    @Req() req,
    @Param('id') id: number,
    @Body() edu: UpdateEducationDto,
  ): Promise<ApiResponse<any>> {
    return this.educationService.updateEdu(id, edu, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete user's education",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Education ID',
    example: 1,
  })
  async deleteEdu(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    return this.educationService.deleteEdu(id, req.user.id);
  }
}
