import { ApiProperty } from '@nestjs/swagger';

export class DeleteLoginLogsResponseDto {
  @ApiProperty({ example: 42, description: 'จำนวนรายการที่ถูกลบ' })
  deletedCount: number;
}
