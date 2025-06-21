// src/user/dto/soft-delete-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SoftDeleteResponseDto {
  @ApiProperty({ example: true, description: 'ผลลัพธ์ว่าลบสำเร็จหรือไม่' })
  @Expose()
  success: boolean;
}
