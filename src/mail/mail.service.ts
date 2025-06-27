// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    secure: false, // ใช้ STARTTLS
    auth: {
      user: process.env.MAILERSEND_SMTP_USER, // อีเมลที่ verify แล้ว
      pass: process.env.MAILERSEND_SMTP_PASS, // รหัส SMTP (สร้างจาก Dashboard)
    },
  });

  async sendPdf({
    to,
    subject,
    text,
    pdfBuffer,
    filename,
  }: {
    to: string;
    subject: string;
    text: string;
    pdfBuffer: Buffer;
    filename: string;
  }) {
    return this.transporter.sendMail({
      from: `"System Bot" <${process.env.MAILERSEND_SMTP_USER}>`,
      to,
      subject,
      text,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
