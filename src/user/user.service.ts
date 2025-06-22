import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { $Enums, Prisma, Role, User } from '@prisma/client';
import { UserSearchDto } from './dto/user-search.dto';
import { UserEntity } from './entities/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // async create(dto: CreateUserDto) {
  //   return this.prisma.user.create({ data: dto });
  // }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async search(query: UserSearchDto): Promise<UserEntity[]> {
    const {
      name,
      email,
      phoneNumber,
      order,
      orderBy,
      page = '1',
      perPage = '10',
    } = query;

    const where: Prisma.UserWhereInput = {
      ...(name && {
        name: { contains: name, mode: Prisma.QueryMode.insensitive },
      }),
      ...(email && {
        email: { contains: email, mode: Prisma.QueryMode.insensitive },
      }),
      ...(phoneNumber && {
        phoneNumber: {
          contains: phoneNumber,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      isDeleted: false,
    };

    const take = parseInt(perPage);
    const skip = (parseInt(page) - 1) * take;

    const users = await this.prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: { [orderBy]: order },
    });
    return users.map((u) => new UserEntity(u));
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async register(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
    });
  }

  async createWithRole(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashed,
        role: $Enums.Role.ADMIN,
      },
    });
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { id: user.id };
    const access_token = await this.jwtService.signAsync(payload);
    console.log(payload);
    console.log(access_token);
    return { access_token };
  }

  async updateProfile(id: string, data: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data, // Prisma จะอัปเดตเฉพาะ field ที่ส่งมา
    });
  }

  async updateRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async softDelete(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async deletePermanentlyDeletedUsers(): Promise<number> {
    const result = await this.prisma.user.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 วัน
        },
      },
    });
    return result.count;
  }
}
