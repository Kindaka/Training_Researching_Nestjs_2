import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.currentUser;

    console.log('🔒 RolesGuard - Checking roles:', {
      userRole: user?.role,
      requiredRoles: this.roles,
    });

    if (!user || !user.role) {
      console.log('❌ RolesGuard - No user or role found');
      return false;
    }

    // Chuyển đổi tất cả role về uppercase để so sánh
    const userRole = user.role.toUpperCase();
    const allowedRoles = this.roles.map(role => role.toUpperCase());

    const hasPermission = allowedRoles.includes(userRole);
    console.log(`${hasPermission ? '✅' : '❌'} RolesGuard - Permission:`, hasPermission);

    return hasPermission;
  }
}