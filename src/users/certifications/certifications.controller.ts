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
import { CreateCertificationsDto } from './dto/create-certifications.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { CertificationsService } from './certifications.service';
import { UpdateCertificationsDto } from './dto/update-certifications.dto';

@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsServices: CertificationsService) {}
  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add certification to user',
    description: 'Add a new certification to the user profile',
  })
  @ApiBody({
    type: CreateCertificationsDto,
  })
  async addCert(
    @Req() req,
    @Body() cert: CreateCertificationsDto,
  ): Promise<ApiResponse<any>> {
    return this.certificationsServices.addCert(cert, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "update user's certification",
  })
  @ApiBody({
    type: UpdateCertificationsDto,
  })
  async updateCert(
    @Req() req,
    @Param('id') id: number,
    @Body() cert: UpdateCertificationsDto,
  ): Promise<ApiResponse<any>> {
    return this.certificationsServices.updateCert(id, cert, req.user.id);
  }

  @Delete('/cert/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete user's certification",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Certification ID',
    example: 1,
  })
  async deleteCert(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    console.log(id);
    return this.certificationsServices.deleteCert(id, req.user.id);
  }
}
