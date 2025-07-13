import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
  Res,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import axios from 'axios';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiBody({ type: LoginDto })
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication flow' })
  googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const formattedProfile = {
        id: req.user.id,
        displayName: req.user.displayName,
        emails: req.user.emails,
        provider: 'google',
        _json: req.user._json,
      };

      const { access_token } = await this.authService.validateOAuthUser(
        formattedProfile,
        'google',
      );

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return res.redirect('/chats.html');
    } catch (error) {
      throw new HttpException(
        error.message || 'Google authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth authentication flow' })
  linkedinLogin() {
    // Initiates LinkedIn OAuth flow
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  @ApiExcludeEndpoint()
  @ApiQuery({ name: 'code', required: true, type: String })
  async linkedinAuthCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'LINKEDIN_CLIENT_SECRET',
      );
      const redirectUri = this.configService.get<string>(
        'LINKEDIN_CALLBACK_URL',
      );

      if (!clientId || !clientSecret || !redirectUri) {
        throw new HttpException(
          'Missing LinkedIn configuration',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', redirectUri);

      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      const profileResponse = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const profileData = profileResponse.data;

      const formattedProfile = {
        id: profileData.sub,
        displayName:
          profileData.name ||
          `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        emails: [{ value: profileData.email }],
        provider: 'linkedin',
        _json: profileData,
      };

      const { access_token } = await this.authService.validateOAuthUser(
        formattedProfile,
        'linkedin',
      );

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return res.redirect('/chats.html');
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message ||
          error.message ||
          'LinkedIn authentication failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('complete-registration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete user registration with additional details',
  })
  @ApiBody({ type: CompleteRegistrationDto })
  async completeRegistration(
    @Req() req: any,
    @Body() completeRegistrationDto: CompleteRegistrationDto,
  ) {
    return this.authService.completeRegistration(
      req.user.id,
      completeRegistrationDto,
    );
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Initiate password reset process' })
  @ApiBody({ type: ForgetPasswordDto })
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto.email);
  }

  @Post('verify-reset-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify reset code for password reset' })
  @ApiBody({
    type: VerifyResetCodeDto,
  })
  async verifyResetCode(@Req() req, @Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(req.user.id, dto.code);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password with verification code' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Req() req: any, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(req.user.id, dto.newPassword);
  }

  @Patch('verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user email with verification code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  async verifyEmail(@Req() req: any, @Body() body: { code: string }) {
    const { code } = body;
    const userId = req.user.id;

    const isVerified = await this.authService.verifyEmail(userId, code);

    if (isVerified) {
      return { message: 'Email verified successfully' };
    }

    throw new HttpException(
      'Invalid or expired verification code',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Get('resend-verification-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification code' })
  async resendVerificationCode(@Req() req: any) {
    await this.authService.generateAndSendVerificationCode(req.user);
    return {
      success: true,
      message: 'Verification code resent to your email',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  profile(@Req() req: any) {
    return this.usersService.getUserById(req.user.id);
  }
}
