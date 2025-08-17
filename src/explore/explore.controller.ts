import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExploreService } from './explore.service';
import { UsersService } from 'src/users/users.service';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { ExperiencesService } from 'src/users/experiences/experiences.service';
import { CertificationsService } from 'src/users/certifications/certifications.service';
import { EducationService } from 'src/users/education/education.service';

@Controller('explore')
export class ExploreController {
  constructor(
    private readonly exploreService: ExploreService,
    private readonly usersService: UsersService,
    private readonly experiencesService: ExperiencesService,
    private readonly educationService: EducationService,
    private readonly CertificationService: CertificationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Explore users',
    description: 'Retrieve a list of users for exploration purposes',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    example: 'John Doe',
    description: 'Search users by name or company or role in this company',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    type: String,
    example: 'Developer',
    description: 'Filter users by specialization',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    example: 'user@example.com',
    description: 'Filter users by email address',
  })
  @ApiQuery({
    name: 'mentor',
    required: false,
    type: Boolean,
    example: true,
    description: 'Filter users by mentor status',
  })
  async exploreUsers(@Query() query: any): Promise<ApiResponse<any>> {
    return this.usersService.explore(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  async getUserById(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.usersService.getUserById(id);
  }

  @Get(':id/experiences')
  @ApiOperation({
    summary: 'Get user experiences',
    description: 'Retrieve a user experiences',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  async getUserExperiences(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.experiencesService.getExperiences(id);
  }

  @Get(':id/experiences/:experienceId')
  @ApiOperation({
    summary: 'Get user experience by ID',
    description: 'Retrieve a specific user experience by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  @ApiParam({
    name: 'experienceId',
    required: true,
    type: Number,
    description: 'The unique identifier of the user experience',
  })
  async getUserExperienceById(
    @Param('id') id: string,
    @Param('experienceId') experienceId: number,
  ): Promise<ApiResponse<any>> {
    return this.experiencesService.getExperience(experienceId, id);
  }

  @Get(':id/educations')
  @ApiOperation({
    summary: 'Get user educations',
    description: 'Retrieve a user educations',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  async getUserEducations(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.educationService.getEdus(id);
  }

  @Get(':id/educations/:educationId')
  @ApiOperation({
    summary: 'Get user education by ID',
    description: 'Retrieve a specific user education by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  @ApiParam({
    name: 'educationId',
    required: true,
    type: Number,
    description: 'The unique identifier of the user education',
  })
  async getUserEducationById(
    @Param('id') id: string,
    @Param('educationId') educationId: number,
  ): Promise<ApiResponse<any>> {
    return this.educationService.getEduById(educationId, id);
  }

  @Get(':id/certifications')
  @ApiOperation({
    summary: 'Get user certifications',
    description: 'Retrieve a user certifications',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  async getUserCertifications(
    @Param('id') id: string,
  ): Promise<ApiResponse<any>> {
    return this.CertificationService.getCerts(id);
  }

  @Get(':id/certifications/:certificationId')
  @ApiOperation({
    summary: 'Get user certification by ID',
    description:
      'Retrieve a specific user certification by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The unique identifier of the user',
  })
  @ApiParam({
    name: 'certificationId',
    required: true,
    type: Number,
    description: 'The unique identifier of the user certification',
  })
  async getUserCertificationById(
    @Param('id') id: string,
    @Param('certificationId') certificationId: number,
  ): Promise<ApiResponse<any>> {
    return this.CertificationService.getCert(certificationId, id);
  }
}
