import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email ของผู้ใช้งาน',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'รหัสผ่านของผู้ใช้งาน (อย่างน้อย 6 ตัวอักษร)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
