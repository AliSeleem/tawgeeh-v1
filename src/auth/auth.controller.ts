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
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Response } from 'express';
import { ApiResponse as IApiResponse } from 'src/common/interfaces/response.interface';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email/password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('register')
  @ApiOperation({ summary: 'Create new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate email',
  })
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google authentication',
  })
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      // 1️⃣ Format the Google profile data
      const formattedProfile = {
        id: req.user.id,
        displayName: req.user.displayName,
        emails: req.user.emails,
        provider: 'google',
        _json: req.user._json,
      };

      // 2️⃣ Validate and create/update user with the formatted profile
      const { access_token, user, missingFields } =
        await this.authService.validateOAuthUser(formattedProfile, 'google');

      res.cookie('access_token', access_token);

      if (missingFields.length > 0) {
        // Pass existing user data and missing fields as query params
        const queryParams = new URLSearchParams({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          country: user.country || '',
          specialization: user.specialization || '',
          experienceLevel: user.experienceLevel || '',
          bio: user.bio || '',
          missingFields: JSON.stringify(missingFields), // Convert array to a string
        }).toString();

        return res.redirect(`/signup.html?${queryParams}`);
      }

      return res.redirect('/chats.html'); // Redirect after login
    } catch (error) {
      throw new HttpException(
        error.message || 'Google authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth flow' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to LinkedIn authentication',
  })
  linkedinLogin() {}

  @Get('linkedin/callback')
  @ApiExcludeEndpoint()
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

      // Check if necessary values are defined
      if (!clientId || !clientSecret || !redirectUri) {
        throw new HttpException(
          'Missing LinkedIn configuration',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 1️⃣ Get Access Token - Fixed URLSearchParams construction
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', redirectUri);

      // 1️⃣ Get Access Token using axios directly
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      // 2️⃣ Fetch User Profile
      const profileResponse = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const profileData = profileResponse.data;

      // 3️⃣ Format the LinkedIn profile data to match the expected structure
      const formattedProfile = {
        id: profileData.sub,
        displayName:
          profileData.name ||
          `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
        emails: [{ value: profileData.email }],
        provider: 'linkedin',
        _json: profileData,
      };

      // 4️⃣ Validate and create/update user with the formatted profile
      const { access_token, user, missingFields } =
        await this.authService.validateOAuthUser(formattedProfile, 'linkedin');

      res.cookie('access_token', access_token);

      if (missingFields.length > 0) {
        // Pass existing user data and missing fields as query params
        const queryParams = new URLSearchParams({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          country: user.country || '',
          specialization: user.specialization || '',
          experienceLevel: user.experienceLevel || '',
          bio: user.bio || '',
          // missingFields: JSON.stringify(missingFields),
        }).toString();

        return res.redirect(`/signup.html?${queryParams}`);
      }

      return res.redirect('/chats.html'); // Redirect after login
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message ||
          error.message ||
          'LinkedIn authentication failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint for completing registration with additional details
  @Patch('complete-registration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete user registration with additional details',
  })
  @ApiBody({ type: CompleteRegistrationDto })
  @ApiResponse({
    status: 200,
    description: 'Registration completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid/missing required fields',
  })
  async completeRegistration(
    @Req() req,
    @Body()
    completeRegistrationDto: CompleteRegistrationDto,
  ) {
    return this.authService.completeRegistration(
      req.user.id,
      completeRegistrationDto,
    );
  }

  // forget password endpoints
  @Post('forget-password')
  @ApiOperation({ summary: 'Initiate password reset process' })
  @ApiResponse({
    status: 200,
    description: 'Password reset code sent to email',
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found',
  })
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto.email);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password with verification code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid/expired reset code',
  })
  async resetPassword(@Req() req, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      req.user.userId,
      dto.resetCode,
      dto.newPassword,
    );
  }

  // email verification endpoints
  @UseGuards(JwtAuthGuard)
  @Patch('verify-email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code resent successfully',
  })
  async verifyEmail(@Req() req, @Body() body: { code: string }) {
    try {
      const { code } = body;
      const userId = req.user.id;

      const isVerified = await this.authService.verifyEmail(userId, code);

      if (isVerified) {
        return {
          message: 'Email verified successfully',
        };
      }

      throw new HttpException(
        'Invalid or expired verification code',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Verification failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('resend-verification-code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code resent successfully',
  })
  async resendVerificationCode(@Req() req): Promise<IApiResponse<any>> {
    try {
      await this.authService.generateAndSendVerificationCode(req.user);
      return {
        success: true,
        message: 'code resend to your email, check it.',
      };
    } catch (error) {
      throw new HttpException('Error happened', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
  })
  profile(@Req() req) {
    return req.user;
  }
}
