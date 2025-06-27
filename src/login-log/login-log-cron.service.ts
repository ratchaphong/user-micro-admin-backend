// src/login-log/login-log-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LoginLogService } from './login-log.service';
import { PdfReportService } from 'src/pdf-report/pdf-report.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class LoginLogCronService {
  private readonly logger = new Logger(LoginLogCronService.name);

  constructor(
    private readonly loginLogService: LoginLogService,
    private readonly pdfReportService: PdfReportService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 0 1 * *') // ✅ วันที่ 1 เวลา 00:00
  async deleteOldLogsWithPdfEmail() {
    try {
      // 1. สร้าง PDF รายงาน
      const logs = await this.loginLogService.getFirstLoginEachUserInMonth();
      const pdf = await this.pdfReportService.generateLoginReport(logs);

      // 2. ส่งเมลแนบ PDF
      await this.mailService.sendPdf({
        to: 'ratchaphongc1@gmail.com',
        subject: '📋 รายงานการเข้าใช้งาน (ก่อนลบข้อมูล)',
        text: 'แนบรายงาน login ของผู้ใช้ (first login each user) ก่อนลบ log เก่า',
        pdfBuffer: Buffer.from(pdf),
        filename: 'monthly-login-report.pdf',
      });

      // 3. ลบ log เก่าก่อนเดือนนี้
      const result = await this.loginLogService.deleteOldLogs();

      this.logger.log(
        `🧹 [Cron] Deleted ${result.deletedCount} old login logs before this month`,
      );
    } catch (error) {
      this.logger.error(
        '❌ [Cron] Failed to delete old logs or send email',
        error,
      );
    }
  }

  // @Cron('0 30 1 * *') // 🔔 ตัวอย่าง: วันที่ 1 เวลา 01:30 น.
  // ✅ ทุกวัน เวลา 13:37
  // @Cron('37 13 * * *')
  // async sendMonthlyReportOnly() {
  //   try {
  //     this.logger.log('🚀 [Cron] sendMonthlyReportOnly started...');

  //     // 1. สร้าง PDF รายงาน
  //     const logs = await this.loginLogService.getFirstLoginEachUserInMonth();
  //     const pdf = await this.pdfReportService.generateLoginReport(logs);

  //     // 2. ส่งเมลแนบ PDF
  //     await this.mailService.sendPdf({
  //       to: 'ratchaphongc1@gmail.com',
  //       subject: '📋 [Test] รายงานการเข้าใช้งาน (เฉพาะส่งเมล)',
  //       text: 'แนบรายงาน login ของผู้ใช้ (first login each user) ทดสอบส่งเมลเท่านั้น',
  //       pdfBuffer: Buffer.from(pdf),
  //       filename: 'monthly-login-report.pdf',
  //     });

  //     this.logger.log(
  //       `✅ [Cron] Sent monthly login report (test mode, no delete).`,
  //     );
  //   } catch (error) {
  //     this.logger.error(`❌ [Cron] Failed to send test report email`, error);
  //   }
  // }
}
