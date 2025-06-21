import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserSearchDto {
  @ApiPropertyOptional({ example: 'John', description: 'ค้นหาจากชื่อ' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'ค้นหาจากอีเมล',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '0812345678',
    description: 'ค้นหาจากเบอร์โทร',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'เรียงตาม field เช่น name, createdAt',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? 'createdAt')
  orderBy: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    description: 'ลำดับการเรียง (asc/desc)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => value ?? 'desc')
  order: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ example: '1', description: 'หน้า (เริ่มจาก 1)' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => value ?? '1')
  page: string = '1';

  @ApiPropertyOptional({ example: '10', description: 'จำนวนรายการต่อหน้า' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => value ?? '10')
  perPage: string = '10';
}
