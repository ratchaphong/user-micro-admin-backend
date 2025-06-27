import { Module } from '@nestjs/common';
import { LoginLogController } from './login-log.controller';
import { LoginLogService } from './login-log.service';
import { JwtStrategy } from 'src/user/jwt.strategy';
import { LoginLogCronService } from './login-log-cron.service';

@Module({
  controllers: [LoginLogController],
  providers: [LoginLogCronService, LoginLogService, JwtStrategy],
})
export class LoginLogModule {}
