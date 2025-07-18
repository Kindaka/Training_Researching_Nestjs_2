import { BadRequestException } from "@nestjs/common";
import { User } from "src/modules/user/entities/user.entity";
import { Role } from "src/core/enums/role.enum";

export class Permission {
  static check(id: number, currentUser: User) {
    if (id === currentUser.id) return;
    if (currentUser.role === Role.ADMIN) return;
    throw new BadRequestException('Bạn không có quyền thực hiện hành động này');
  }
}
