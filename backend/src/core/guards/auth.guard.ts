import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { UserService } from '../../modules/user/services/user.service';
import { User } from '../../modules/user/entities/user.entity';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';


@Injectable()
export class AuthGuard {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private logger: CustomLoggerService,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    this.logger.debug('Checking AuthGuard...');
    
    const token = this.extractTokenFromHeader(request);
    this.logger.debug(`Auth Header: ${token}`);

    if (!token) {
      this.logger.warn('Missing authentication token');
      throw new ForbiddenException('Missing or invalid token');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: secret
      });
      const user: User | undefined= await this.userService.findByEmail(payload.email);
      console.log('👤 Found user:', user);

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Gán cả payload và user data vào request
      (request as any).user = payload;
      (request as any).currentUser = user;
      
      console.log('✅ Auth successful - User:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      return true;
    } catch (error) {
      this.logger.error('Invalid authentication token', error instanceof Error ? error.stack : '');
      throw new ForbiddenException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
