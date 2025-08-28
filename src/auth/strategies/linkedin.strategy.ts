import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  private readonly logger = new Logger(LinkedInStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID')!,
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL')!,
      // LinkedIn v2 API uses these scopes:
      // scope: ['r_emailaddress', 'r_liteprofile'],
      // If you need OpenID Connect:
      scope: ['openid', 'profile', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    try {
      this.logger.debug(
        'LinkedIn profile data:',
        JSON.stringify(profile, null, 2),
      );

      // Pass the user to your auth service for processing
      const user = await this.authService.validateOAuthUser(
        profile,
        'linkedin',
      );
      return done(null, user);
    } catch (error) {
      this.logger.error('Error validating LinkedIn profile:', error);
      return done(error, false);
    }
  }
}
