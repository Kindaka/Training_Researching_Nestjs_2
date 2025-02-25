import { 
    Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, 
    ClassSerializerInterceptor,
    UseInterceptors,
    UseGuards
  } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dtos/user.dto';
import { LoggingInterceptor } from '../../../core/interceptors/logging.interceptor';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { CurrentUser } from '../decorators/user.decorator';
import { RolesGuard } from '../../../core/guards/role.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from '../../../core/helpers/check-permission.helper';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseInterceptors(ClassSerializerInterceptor) // Thg trên và dưới đều giống nhau chỉ khác mỗi ở trên là xài có sẵn phân biệt bằng @Exclude trong entity
@UseInterceptors(LoggingInterceptor) // Còn thg dưới là custom 
// Ghi Log Request & Response dữ liệu, Ẩn Thông Tin Nhạy Cảm (Password), Chuẩn Hóa Lỗi API 
export class UserController {
  constructor(private readonly userService: UserService, 
              private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']), PermissionGuard)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  findAll(): Promise<User[]> {
    console.log('Request from controller!');
    return this.userService.findAll();
  }

  @Get('/current-user')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(@CurrentUser() currentUser: User){
    return currentUser;
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User details', type: User })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }


  @Put('/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ){
    console.log('Request body from client:', updateUserDto);
    return this.userService.update(id, updateUserDto, currentUser);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard, new RolesGuard(['ADMIN']))
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number, 
  @CurrentUser() currentUser: User) {
    return this.userService.remove(id, currentUser);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register new user (old version)' })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'User login (old version)' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

}