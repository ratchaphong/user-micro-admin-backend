// src/user/dto/delete-permanently-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeletePermanentlyResponseDto {
  @ApiProperty({ example: 5, description: 'จำนวนผู้ใช้ที่ถูกลบถาวร' })
  @Expose()
  deletedCount: number;

  @ApiProperty({ example: 'http', description: 'ที่มาของการเรียก (http/cron)' })
  @Expose()
  source: string;
}
