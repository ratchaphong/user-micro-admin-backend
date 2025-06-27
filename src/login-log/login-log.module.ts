import { Module } from '@nestjs/common';
import { LoginLogController } from './login-log.controller';
import { LoginLogService } from './login-log.service';
import { JwtStrategy } from 'src/user/jwt.strategy';
import { LoginLogCronService } from './login-log-cron.service';
import { PdfReportModule } from 'src/pdf-report/pdf-report.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PdfReportModule],
  controllers: [LoginLogController],
  providers: [LoginLogCronService, LoginLogService, JwtStrategy, MailService],
})
export class LoginLogModule {}
