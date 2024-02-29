import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/modules/user/schema/user.schema';

@Injectable()
export class StrategyService extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('SECRET_KEY'),
    });
  }
  async validate(payload: any) {
    const user = await this.userModel.findById(payload._id).select('+rootUser');
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
