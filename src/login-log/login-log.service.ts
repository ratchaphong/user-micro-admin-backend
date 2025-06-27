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

    const results = await this.prisma.loginLog.groupBy({
      by: ['userId'],
      where: {
        loginAt: {
          gte: start,
          lte: end,
        },
      },
      _min: {
        loginAt: true,
      },
    });

    // ใช้ผลลัพธ์ที่ได้มา join หา log record จริง
    const logs = await Promise.all(
      results
        .filter((r) => r._min.loginAt !== null)
        .map((r) =>
          this.prisma.loginLog.findFirst({
            where: {
              userId: r.userId,
              loginAt: r._min.loginAt as Date,
            },
          }),
        ),
    );

    return logs;
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
