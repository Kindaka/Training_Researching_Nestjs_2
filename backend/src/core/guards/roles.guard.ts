import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { CurrentUser } from '../../modules/auth/interfaces/current-user.interface'; // 👈 tạo file này nếu chưa có

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request & {
      currentUser?: CurrentUser;
    };
    const user = request.currentUser;

    console.log('🔒 RolesGuard - Checking roles:', {
      userRole: user?.role,
      requiredRoles,
    });

    if (!user || !user.role) {
      console.log('❌ RolesGuard - No user or role found');
      return false;
    }

    const userRole = user.role.toUpperCase() as Role;
    const hasRole = requiredRoles.includes(userRole);

    console.log(`${hasRole ? '✅' : '❌'} RolesGuard - Access:`, hasRole);

    return hasRole;
  }
}
