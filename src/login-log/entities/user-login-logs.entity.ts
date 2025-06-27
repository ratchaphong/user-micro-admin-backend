import { ApiProperty } from '@nestjs/swagger';

export class UserLoginLogsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  loginAt: Date;

  @ApiProperty({ required: false })
  logoutAt?: Date;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  userAgent?: string;
}
