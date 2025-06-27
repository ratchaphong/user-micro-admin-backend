// src/login-log/login-log-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoginLogService } from './login-log.service';

@Injectable()
export class LoginLogCronService {
  private readonly logger = new Logger(LoginLogCronService.name);

  constructor(private readonly loginLogService: LoginLogService) {}

  // 🔁 ทุกวันที่ 1 เวลา 00:00 → ลบ log เก่า
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldLogs() {
    const result = await this.loginLogService.deleteOldLogs();
    this.logger.log(
      `🧹 [Cron] Deleted ${result.deletedCount} old login logs before this month`,
    );
  }
}
