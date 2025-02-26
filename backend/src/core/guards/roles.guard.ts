import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

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

    const request = context.switchToHttp().getRequest();
    const user = request.currentUser;

    console.log('🔒 RolesGuard - Checking roles:', {
      userRole: user?.role,
      requiredRoles,
    });

    if (!user || !user.role) {
      console.log('❌ RolesGuard - No user or role found');
      return false;
    }

    const userRole = user.role.toUpperCase();
    const hasRole = requiredRoles.some(role => role === userRole);
    
    console.log(`${hasRole ? '✅' : '❌'} RolesGuard - Access:`, hasRole);
    
    return hasRole;
  }
} 