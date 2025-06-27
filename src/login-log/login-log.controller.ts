import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/user/jwt-auth.guard';
import { UserLoginLogsEntity } from './entities/user-login-logs.entity';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { DeleteLoginLogsResponseDto } from './dto/delete-login-logs.response';

@Controller('login-logs')
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user login logs' }) // ✅ ปรับชื่อให้เหมาะ
  @ApiOkResponse({
    description: 'List of login logs for the current user',
    type: UserLoginLogsEntity,
    isArray: true, // ✅ เพราะส่ง array กลับ
  })
  async getUserLogs(@Req() req: any) {
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    const logs = await this.loginLogService.getUserLoginLogs(req.user.id);
    return plainToInstance(UserLoginLogsEntity, logs);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create login log for current user' })
  @ApiCreatedResponse({
    description: 'Login log created',
    type: UserLoginLogsEntity,
  })
  async createLoginLog(@Body() dto: CreateLoginLogDto, @Req() req: any) {
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }

    const log = await this.loginLogService.createLoginLog({
      userId: req.user.id,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    return plainToInstance(UserLoginLogsEntity, log);
  }

  @Patch('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update logout time of latest login' })
  @ApiNoContentResponse({
    description: 'Successfully updated logout time for latest login',
  })
  async logout(@Req() req: any): Promise<void> {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    await this.loginLogService.updateLatestLogoutTime(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/my/monthly')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user login logs this month' })
  @ApiOkResponse({
    description: 'Current user login logs in this month',
    type: UserLoginLogsEntity,
    isArray: true,
  })
  async getMyLogsThisMonth(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const logs = await this.loginLogService.getUserLogsInCurrentMonth(userId);
    return plainToInstance(UserLoginLogsEntity, logs);
  }

  @Get('/all/monthly')
  @ApiOperation({ summary: 'Get all user login logs this month' })
  @ApiOkResponse({
    description: 'All user login logs in this month',
    type: UserLoginLogsEntity,
    isArray: true,
  })
  async getAllLogsThisMonth() {
    const logs = await this.loginLogService.getAllLogsInCurrentMonth();
    return plainToInstance(UserLoginLogsEntity, logs);
  }

  @Get('/all/monthly/first-login')
  @ApiOperation({ summary: 'Get first login for each user in current month' })
  @ApiOkResponse({
    description: 'First login per user in this month',
    type: UserLoginLogsEntity,
    isArray: true,
  })
  async getFirstLoginPerUserInMonth() {
    const logs = await this.loginLogService.getFirstLoginEachUserInMonth();
    return plainToInstance(UserLoginLogsEntity, logs);
  }

  @Delete('/cleanup')
  @ApiOperation({ summary: 'Delete login logs before current month' })
  @ApiOkResponse({
    description: 'จำนวนรายการที่ถูกลบเรียบร้อย',
    type: DeleteLoginLogsResponseDto,
  })
  async cleanupOldLogs(): Promise<DeleteLoginLogsResponseDto> {
    return this.loginLogService.deleteOldLogs();
  }
}
