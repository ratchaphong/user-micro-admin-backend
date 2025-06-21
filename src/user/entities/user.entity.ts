import { $Enums, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class UserEntity implements User {
  @Expose()
  @ApiProperty({ example: 'clx1234567890abcdef', description: 'ID ผู้ใช้' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'John Doe', description: 'ชื่อผู้ใช้' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'john@example.com', description: 'อีเมล' })
  email: string;

  password: string; // ไม่ @Expose() เพื่อไม่ให้แสดง

  @Expose()
  @ApiProperty({ example: '2025-06-19T10:00:00.000Z', type: String })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-06-20T12:00:00.000Z', type: String })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar: string | null;

  @Expose()
  @ApiPropertyOptional({ example: '0812345678' })
  phoneNumber: string | null;

  @Expose()
  @ApiPropertyOptional({ example: '123 ถนนพระราม 9' })
  address: string | null;

  @Expose()
  @ApiPropertyOptional({ example: '2025-06-30T08:00:00.000Z', type: String })
  deletedAt: Date | null;

  @Expose()
  @ApiProperty({ example: false })
  isDeleted: boolean;

  @Expose()
  @ApiProperty({ example: $Enums.Role.USER })
  role: $Enums.Role;

  // ✅ Constructor เผื่อไว้
  constructor(partial?: Partial<UserEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
