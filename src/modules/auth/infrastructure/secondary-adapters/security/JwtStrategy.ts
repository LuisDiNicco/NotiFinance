import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../../application/AuthService';

export interface JwtPayload {
  sub: string;
  email: string;
  isDemo: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret', 'secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    await this.authService.validateUser(payload.sub);
    return payload;
  }
}
