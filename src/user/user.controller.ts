import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  Query,
  Patch,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // ✅ เพิ่ม import
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { DeletePermanentlyResponseDto } from './dto/delete-permanently-response.dto';
import { SoftDeleteResponseDto } from './dto/soft-delete-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { $Enums } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'get-user-by-id' })
  async getUserById(id: string) {
    return this.userService.findOne(id); // คืนค่า user หรือ null
  }

  // @Post()
  // @ApiOperation({
  //   summary: 'Create a new user',
  //   description: `Registers a new user into the system by accepting their name, email, and password.
  // The user data will be stored in the database, and a response with the created user details (excluding the password) will be returned.
  // This endpoint is typically used for user sign-up or registration screens.`,
  // })
  // @ApiCreatedResponse({
  //   description: 'User created successfully',
  //   type: UserEntity,
  // })
  // async create(@Body() dto: CreateUserDto) {
  //   const user = await this.userService.create(dto);
  //   return plainToInstance(UserEntity, user);
  // }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: `Registers a new user in the system using name, email, and password.  
  Returns the created user's public information (excluding password).  
  Use this for sign-up screens.`,
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: UserEntity,
  })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.userService.register(dto);
    return plainToInstance(UserEntity, user);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: `Authenticates a user using email and password.  
  Returns a JWT access token if the credentials are valid.  
  Use this token to access protected routes.`,
  })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Login failed (invalid email or password)',
  })
  async login(@Body() dto: LoginUserDto): Promise<LoginResponseDto> {
    console.log(dto);
    return this.userService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description: `Retrieves the profile information of the currently authenticated user.  
  This route requires a valid JWT access token in the Authorization header.`,
  })
  @ApiOkResponse({
    description: 'Return user profile',
    type: UserEntity,
  })
  async getProfile(@Req() req: any) {
    console.log('🔥 req.user:', req.user); // ตรวจสอบว่ามาไหม
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(req.user.id);
    return plainToInstance(UserEntity, user);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Get all users (with filters)',
    description: `Returns a list of all users. Supports filtering, ordering, and pagination.`,
  })
  @ApiOkResponse({
    description: 'List of users',
    type: UserEntity,
    isArray: true,
  })
  async search(@Query() query: UserSearchDto): Promise<UserEntity[]> {
    const users = await this.userService.search(query);
    return plainToInstance(UserEntity, users, {
      // excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile (excluding role)' })
  @ApiOkResponse({ description: 'User profile updated', type: UserEntity })
  async updateUserProfile(
    @Body() dto: UpdateUserProfileDto,
    @Req() req: any,
  ): Promise<UserEntity> {
    console.log('🔥 req.user:', req.user); // ตรวจสอบว่ามาไหม
    if (!req.user?.id) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.updateProfile(req.user.id, dto);
    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiOkResponse({ description: 'User role updated', type: UserEntity })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ): Promise<UserEntity> {
    console.log('🔥 req.user:', req.user); // ตรวจสอบว่ามาไหม
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new UnauthorizedException();
    }

    // 🔍 ดึงข้อมูล user ปัจจุบันจาก DB
    const currentUser = await this.userService.findOne(currentUserId);
    if (!currentUser || currentUser.role === $Enums.Role.USER) {
      throw new ForbiddenException('Only ADMIN can update user roles');
    }

    // ✅ ดำเนินการอัปเดต role
    const user = await this.userService.updateRole(id, dto.role);
    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update any user profile (ADMIN only)' })
  @ApiOkResponse({ description: 'User profile updated', type: UserEntity })
  async adminUpdateUserProfile(
    @Param('id') id: string,
    @Body() dto: UpdateUserProfileDto,
    @Req() req: any,
  ): Promise<UserEntity> {
    console.log('🔥 req.user:', req.user);
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new UnauthorizedException();
    }

    // 🔍 ดึงข้อมูล user ปัจจุบันจาก DB
    const currentUser = await this.userService.findOne(currentUserId);
    if (!currentUser || currentUser.role === $Enums.Role.USER) {
      throw new ForbiddenException('Only ADMIN can update other user profiles');
    }

    // ✅ ดำเนินการอัปเดตโปรไฟล์ของ user อื่น
    const user = await this.userService.updateProfile(id, dto);
    return plainToInstance(UserEntity, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: `Fetch a single user's details by their unique identifier.`,
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserEntity,
  })
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findOne(id);
    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: `Returns a list of all registered users.`,
  })
  @ApiOkResponse({
    description: 'List of users',
    type: UserEntity,
    isArray: true,
  })
  async findAll(): Promise<UserEntity[]> {
    const users = await this.userService.findAll();
    return users.map((u) => plainToInstance(UserEntity, u));
  }

  @Delete('clean-deleted')
  @ApiOperation({ summary: 'Delete permanently users who were soft-deleted' })
  @ApiOkResponse({
    description: 'Deleted users permanently',
    type: DeletePermanentlyResponseDto,
  })
  async deletePermanentlyDeletedUsers(): Promise<DeletePermanentlyResponseDto> {
    const count = await this.userService.deletePermanentlyDeletedUsers();
    return plainToInstance(DeletePermanentlyResponseDto, {
      deletedCount: count,
      source: 'http',
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiOkResponse({
    description: 'User soft deleted',
    type: SoftDeleteResponseDto,
  })
  async softDelete(@Param('id') id: string): Promise<SoftDeleteResponseDto> {
    await this.userService.softDelete(id);
    return plainToInstance(SoftDeleteResponseDto, { success: true });
  }
}
