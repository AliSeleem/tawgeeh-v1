import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add achievement to user',
    description: 'Add a new achievement to the user profile',
  })
  @ApiBody({
    type: CreateAchievementDto,
  })
  create(@Body() createAchievementDto: CreateAchievementDto, @Req() req) {
    return this.achievementsService.create(createAchievementDto, req.user.id);
  }

  @Get(':userId')
  @ApiOperation({
    summary: "get user's achievements",
    description: 'Get all achievements of the user',
  })
  findAll(@Param('userId') userId: string) {
    return this.achievementsService.findAll(userId);
  }

  @Get(':userId/:id')
  @ApiOperation({
    summary: "get user's achievement",
    description: 'Get a specific achievement of the user',
  })
  findOne(@Param('id') id: number, @Param('userId') userId: string) {
    return this.achievementsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "update user's achievement",
  })
  @ApiBody({
    type: UpdateAchievementDto,
  })
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    return this.achievementsService.update(
      +id,
      req.user.id,
      updateAchievementDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "delete user's achievement",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Achievement ID',
    example: 1,
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.achievementsService.remove(+id, req.user.id);
  }
}
