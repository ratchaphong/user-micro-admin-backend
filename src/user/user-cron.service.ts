// src/user/user-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { DeletePermanentlyResponseDto } from './dto/delete-permanently-response.dto';

@Injectable()
export class UserCronService {
  private readonly logger = new Logger(UserCronService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async deleteSoftDeletedUsers() {
  //   const count = await this.userService.deletePermanentlyDeletedUsers();
  //   this.logger.log(`✅ Deleted ${count} soft-deleted users.`);
  // }
  @Cron('0 0 * * *') // เที่ยงคืน
  async deleteSoftDeletedUsers() {
    const count = await this.userService.deletePermanentlyDeletedUsers();
    const result = plainToInstance(DeletePermanentlyResponseDto, {
      deletedCount: count,
      source: 'cron',
    });

    // 🔥 log แบบ structured
    this.logger.log(
      `🧹 [Cron] Permanently deleted ${result.deletedCount} users | source: ${result.source}`,
    );
  }

  @Cron('*/15 * * * * *') // 🧪 ทดสอบ Hello ทุก 15 วินาที
  handleTestHelloCron() {
    const service = UserCronService.name;
    const port = this.configService.get('PORT');
    const queueName = this.configService.get('QUEUE_NAME');

    this.logger.log(
      `👋 Hello from ${service} | PORT: ${port} | QUEUE: ${queueName}`,
    );
  }
}
