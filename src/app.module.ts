import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoginLogModule } from './login-log/login-log.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 ทำให้ใช้ได้ทั้งแอป
    }),
    ScheduleModule.forRoot(),
    UserModule,
    LoginLogModule,
    PrismaModule,
  ],
  providers: [MailService],
})
export class AppModule {}
