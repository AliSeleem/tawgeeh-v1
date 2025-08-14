import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { CertificationsService } from 'src/users/certifications/certifications.service';
import { CreateCertificationsDto } from 'src/users/certifications/dto/create-certifications.dto';
import { UpdateCertificationsDto } from 'src/users/certifications/dto/update-certifications.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CreateEducationDto } from 'src/users/education/dto/create-education.dto';
import { EducationService } from 'src/users/education/education.service';
import { CreateExperiencesDto } from 'src/users/experiences/dto/create-experiences.dto';
import { UpdateExperiencesDto } from 'src/users/experiences/dto/update-experiences.dto';
import { ExperiencesService } from 'src/users/experiences/experiences.service';
import { UsersService } from 'src/users/users.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly userService: UsersService,
    private readonly experienceService: ExperiencesService,
    private readonly educationService: EducationService,
    private readonly CertificationService: CertificationsService,
  ) {}

  // ========== BASIC PROFILE ROUTES ==========
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve the profile information of the authenticated user',
  })
  async getProfile(@Req() req: Request): Promise<ApiResponse<Express.User>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.getUserProfile(req.user['id']);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the profile information of the authenticated user',
  })
  async updateProfile(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
  ): Promise<ApiResponse<Express.User>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateUser(req.user['id'], body);
  }

  @Patch('profileImg')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // @UseInterceptors(FileInterceptor('image_url'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Update image',
    description: 'Update user profile image',
  })
  async updateUserImg(
    @Req() req: Request,
    @UploadedFile() image_url: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!image_url) {
      throw new BadRequestException('No file uploaded');
    }
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateProfileImg(
      req.user['id'],
      `http://168.231.114.196/uploads/images/${image_url.filename}`,
    );
  }

  @Delete('profileImg')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user profile image',
    description: 'Remove the profile image of the authenticated user',
  })
  async DeleteUserImg(@Req() req: Request): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateProfileImg(req.user['id'], null);
  }

  @Patch('coverImg')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // @UseInterceptors(FileInterceptor('cover_url'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Update cover image',
    description: 'Update user cover image',
  })
  async updateUserCover(
    @Req() req: Request,
    @UploadedFile() cover_url: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!cover_url) {
      throw new BadRequestException('No file uploaded');
    }
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }

    return this.userService.updateCoverImg(
      req.user['id'],
      `http://168.231.114.196/uploads/images/${cover_url.filename}`,
    );
  }

  @Delete('coverImg')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete cover image',
    description: 'Delete user cover image',
  })
  async DeleteUserCover(@Req() req: Request): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }

    return this.userService.updateCoverImg(req.user['id'], null);
  }

  @Patch('video')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video files are allowed!'), false);
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload video',
    description: 'Upload a video file for the user',
  })
  async uploadVideo(
    @Req() req: Request,
    @UploadedFile() video: Express.Multer.File,
  ): Promise<ApiResponse<any>> {
    if (!video) {
      throw new BadRequestException('No file uploaded');
    }
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateVideoUrl(
      req.user['id'],
      `http://168.231.114.196/uploads/videos/${video.filename}`,
    );
  }

  @Delete('video')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete video',
    description: 'Remove the video file of the authenticated user',
  })
  async DeleteVideo(@Req() req: Request): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.userService.updateVideoUrl(req.user['id'], null);
  }

  // ========== EXPERIENCE ROUTES ==========
  @Post('experiences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create user experience',
    description: 'Create a new experience for the authenticated user',
  })
  async createExperience(
    @Req() req: Request,
    @Body() body: CreateExperiencesDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.experienceService.addExperience(req.user['id'], body);
  }

  @Get('experiences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user experience by ID',
    description:
      'Retrieve a specific experience of the authenticated user by ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Experience ID' })
  async getExperienceById(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.experienceService.getExperience(id, req.user['id']);
  }

  @Patch('experiences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user experiences',
    description: 'Update the experiences of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Experience ID' })
  async updateExperiences(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() body: UpdateExperiencesDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.experienceService.updateExperience(id, req.user['id'], body);
  }

  @Delete('experiences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user experience',
    description: 'Delete a specific experience of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Experience ID' })
  async deleteExperience(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.experienceService.deleteExperience(id, req.user['id']);
  }

  // ========= EDUCATION ROUTES ==========
  @Post('education')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create user education',
    description: 'Create a new education record for the authenticated user',
  })
  async createEducation(
    @Req() req: Request,
    @Body() body: CreateEducationDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.educationService.addEdu(body, req.user['id']);
  }

  @Get('education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user education by ID',
    description:
      'Retrieve a specific education record of the authenticated user by ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Education ID' })
  async getEducationById(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.educationService.getEduById(id, req.user['id']);
  }

  @Patch('education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user education',
    description: 'Update a specific education record of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Education ID' })
  async updateEducation(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() body: CreateEducationDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.educationService.updateEdu(id, body, req.user['id']);
  }

  @Delete('education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user education',
    description: 'Delete a specific education record of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Education ID' })
  async deleteEducation(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.educationService.deleteEdu(id, req.user['id']);
  }

  // ========= CERTIFICATIONS ROUTES ==========
  @Post('certifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create user certification',
    description: 'Create a new certification for the authenticated user',
  })
  async createCertification(
    @Req() req: Request,
    @Body() body: CreateCertificationsDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.CertificationService.addCert(body, req.user['id']);
  }

  @Get('certifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user certification by ID',
    description:
      'Retrieve a specific certification of the authenticated user by ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Certification ID' })
  async getCertificationById(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.CertificationService.getCert(id, req.user['id']);
  }

  @Patch('certifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user certification',
    description: 'Update a specific certification of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Certification ID' })
  async updateCertification(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() body: UpdateCertificationsDto,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.CertificationService.updateCert(id, body, req.user['id']);
  }

  @Delete('certifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user certification',
    description: 'Delete a specific certification of the authenticated user',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Certification ID' })
  async deleteCertification(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponse<any>> {
    if (!req.user || typeof req.user['id'] === 'undefined') {
      throw new Error('User information is missing from request.');
    }
    return this.CertificationService.deleteCert(id, req.user['id']);
  }
}
