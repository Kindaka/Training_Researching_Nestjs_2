import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../modules/user/services/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('1️⃣ Checking AuthGuard...');

    try {
      const authHeader = request.headers.authorization;
      console.log('🔑 Auth Header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ForbiddenException('Missing or invalid token');
      }

      const token = authHeader.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      console.log('✅ Token payload:', payload);

      const user = await this.userService.findByEmail(payload.email);
      console.log('👤 Found user:', user);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Gán cả payload và user data vào request
      request.user = payload;
      request.currentUser = user;
      
      console.log('✅ Auth successful - User:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      return true;

    } catch (error) {
      console.error('❌ Auth Error:', error);
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
