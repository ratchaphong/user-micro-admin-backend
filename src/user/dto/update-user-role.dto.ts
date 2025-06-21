// src/user/dto/update-user-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role, example: 'STAFF' })
  @IsEnum(Role)
  role: Role;
}
