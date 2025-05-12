import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ExperienceLevel, Gender, SignupMethod, User } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import {
  EmailType,
  NotificationType,
} from 'src/notification/enums/notification-type.enum';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password ?? ''))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.generateToken(user);
  }

  async register(data: RegisterDto) {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data,
    });

    // generate and send verification code
    await this.generateAndSendVerificationCode(user);

    // Generate JWT
    return this.generateToken(user);
  }

  async validateOAuthUser(profile: any, provider: 'google' | 'linkedin') {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.emails[0].value },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: provider === 'google' ? profile.id : null,
          linkedinId: provider === 'linkedin' ? profile.id : null,
          signup_method: provider.toLocaleUpperCase() as SignupMethod,
        },
      });
    }

    // Identify missing fields
    const missingFields: string[] = [];

    if (!user.phone) missingFields.push('phone');
    if (!user.gender) missingFields.push('gender');
    if (!user.country) missingFields.push('country');
    if (!user.specialization) missingFields.push('specialization');
    if (!user.experienceLevel) missingFields.push('experienceLevel');
    if (!user.bio) missingFields.push('bio');

    const { access_token } = this.generateToken(user);

    return {
      access_token,
      user, // Send full user data to prefill the form
      missingFields, // Indicate what needs to be completed
    };
  }

  async completeRegistration(userId: number, data: CompleteRegistrationDto) {
    // fined the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // update the user to complete his registration
    await this.prisma.user.update({
      where: { id: user.id },
      data,
    });

    // Return a new token indicating full registration
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    return {
      access_token: this.jwtService.sign({ sub: user.id, role: user.role }),
    };
  }

  async generateAndSendVerificationCode(user: {
    id: number;
    name: string;
    email: string;
  }): Promise<string> {
    // Generate 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Update user with new verification code and expiration
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send verification email
    await this.notificationService.sendNotification(
      NotificationType.EMAIL,
      user.email,
      { name: user.name, verificationCode },
      EmailType.EMAIL_VERIFICATION,
    );

    return verificationCode;
  }

  async verifyEmail(userId: number, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        verificationCode: code,
        verificationCodeExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return false;
    }

    // Update user as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return true;
  }

  async forgetPassword(email: string) {
    // find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    // make reset code
    const resetCode: string = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    try {
      // Save reset code with expiration
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode,
          resetCodeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // Send reset code via notification service
      await this.notificationService.sendNotification(
        NotificationType.EMAIL,
        user.email,
        { name: user.name, resetCode },
        EmailType.PASSWORD_RESET,
      );

      // Generate and return a token (optional)
      return this.generateToken(user);
    } catch (error) {
      // Log the error and throw a generic error to prevent information leakage
      console.error('Password reset error:', error);
      throw new BadRequestException('Unable to process password reset');
    }
  }

  async resetPassword(userId: number, resetCode: string, newPassword: string) {
    // Validate input
    if (!resetCode || !newPassword) {
      throw new BadRequestException('Reset code and new password are required');
    }

    try {
      // Find user with matching reset code and valid expiration
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      // check if the code is expired
      if (
        !(resetCode === user?.resetCode) ||
        (user.resetCodeExpires && user.resetCodeExpires < new Date(Date.now()))
      ) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and clear reset code
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetCode: null,
          resetCodeExpires: null,
        },
      });

      return { message: 'Password successfully reset' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new BadRequestException('Unable to reset password');
    }
  }
}
