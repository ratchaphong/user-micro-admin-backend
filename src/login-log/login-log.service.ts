import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class LoginLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLoginLog(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    failReason?: string;
  }) {
    return this.prisma.loginLog.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getUserLoginLogs(userId: string) {
    return this.prisma.loginLog.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });
  }

  async getUserLogsInCurrentMonth(userId: string) {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    return this.prisma.loginLog.findMany({
      where: {
        userId,
        loginAt: { gte: start, lte: end },
      },
      orderBy: { loginAt: 'asc' },
    });
  }

  async getAllLogsInCurrentMonth() {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    return this.prisma.loginLog.findMany({
      where: {
        loginAt: { gte: start, lte: end },
      },
      orderBy: { loginAt: 'asc' },
    });
  }

  async deleteOldLogs() {
    const cutoff = startOfMonth(new Date()); // 1st day of current month
    const result = await this.prisma.loginLog.deleteMany({
      where: {
        loginAt: { lt: cutoff },
      },
    });
    return { deletedCount: result.count };
  }

  async getFirstLoginEachUserInMonth() {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    // ดึงข้อมูลทั้งหมดของเดือนนี้
    const logs = await this.prisma.loginLog.findMany({
      where: {
        loginAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        loginAt: 'desc', // เพื่อให้ใหม่สุดมาก่อน
      },
      include: { user: true },
    });

    // ใช้ Map เพื่อเก็บเฉพาะล่าสุดของแต่ละวัน ต่อ user
    const latestPerUserPerDay = new Map<string, (typeof logs)[0]>();

    for (const log of logs) {
      const key = `${log.userId}_${log.loginAt.toISOString().split('T')[0]}`; // เช่น "u123_2025-06-27"
      if (!latestPerUserPerDay.has(key)) {
        latestPerUserPerDay.set(key, log); // ✅ เก็บรายการแรกที่เจอของวันนั้น (คือรายการล่าสุด)
      }
    }

    return Array.from(latestPerUserPerDay.values());
  }

  async updateLatestLogoutTime(userId: string) {
    const latestLog = await this.prisma.loginLog.findFirst({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });

    if (!latestLog) {
      throw new NotFoundException('No login session found');
    }

    if (latestLog.logoutAt) {
      throw new BadRequestException(
        'This login session has already been logged out.',
      );
    }

    await this.prisma.loginLog.update({
      where: { id: latestLog.id },
      data: { logoutAt: new Date() },
    });
  }
}
