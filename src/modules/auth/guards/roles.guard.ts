import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoleEnums = this.reflector.getAllAndOverride<Rol[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoleEnums) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // console.log(user);

    return requiredRoleEnums.some((role) => user?.role?.includes(role));
  }
}
