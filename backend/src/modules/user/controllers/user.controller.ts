import { 
    Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe,
    UseInterceptors, ForbiddenException
  } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dtos/user.dto';
import { LoggingInterceptor } from '../../../core/interceptors/logging.interceptor';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { CurrentUser } from '../decorators/user.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../../core/decorators/public.decorator';
import { Role } from '../../../core/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UserService, 
              private readonly authService: AuthService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/current-user')
  @ApiOperation({ summary: 'Get current user profile' })
  getCurrentUser(@CurrentUser() currentUser: User) {
    return currentUser;
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User details', type: User })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ): Promise<User> {
    return this.userService.findOne(id, currentUser);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ) {
    return this.userService.update(id, updateUserDto, currentUser);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ) {
    return this.userService.remove(id, currentUser);
  }

  @Post('/register')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('/login')
  @Public()
  @ApiOperation({ summary: 'User login' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }
}