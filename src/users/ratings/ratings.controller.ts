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
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateRatingsDto } from './dto/create-ratings.dto';
import { UpdateRatingsDto } from './dto/update-ratings.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingService: RatingsService) {}

  @Post('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rate a user',
    description: 'Add a rating to a user',
  })
  @ApiBody({
    type: CreateRatingsDto,
  })
  rate(
    @Req() req,
    @Param('userId') userId: number,
    @Body() rating: CreateRatingsDto,
  ) {
    return this.ratingService.create(rating, userId, req.user.id);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get all ratings',
    description: 'Get all ratings for a user',
  })
  async getAll(@Param('userId') userId: number) {
    return this.ratingService.getAll(userId);
  }

  @Get(':userId/:ratingId')
  @ApiOperation({
    summary: 'Get rating',
    description: 'Get a rating for a user',
  })
  async get(
    @Param('userId') userId: number,
    @Param('ratingId') ratingId: number,
  ) {
    return this.ratingService.getOne(userId, ratingId);
  }

  @Patch(':ratingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update rating',
    description: 'Update Rating on a user',
  })
  @ApiBody({
    type: UpdateRatingsDto,
  })
  update(
    @Req() Req,
    @Param('ratingId') ratingId: number,
    @Body() rating: UpdateRatingsDto,
  ) {
    return this.ratingService.update(ratingId, rating, Req.user.id);
  }

  @Patch(':ratingId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Like rating',
    description: 'Like a rating',
  })
  like(@Param('ratingId') ratingId: number) {
    return this.ratingService.like(ratingId);
  }

  @Delete(':ratingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete rating',
    description: 'Delete a rating',
  })
  delete(@Param('ratingId') ratingId: number, @Req() req) {
    return this.ratingService.delete(ratingId, req.user.id);
  }
}
