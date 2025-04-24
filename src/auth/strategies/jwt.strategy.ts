import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'شنتسبشسابنتشاسبشتسابنتشساب',
    });
  }

  async validate(payload: { sub: number; role: string }) {
    return { id: payload.sub, role: payload.role }; // return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }
}
