// user.module.ts
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserCronService } from './user-cron.service';
import { LoginLogModule } from 'src/login-log/login-log.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    LoginLogModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserCronService, JwtStrategy],
})
export class UserModule {}
