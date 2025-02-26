import { BadRequestException } from "@nestjs/common";
import { User } from "src/modules/user/entities/user.entity";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export class Permission{
    static check(id: number, currentUser: User){
        if (id === currentUser.id) return;
        if (currentUser.role === 'ADMIN') return;
        throw new BadRequestException('Bạn không có quyền thực hiện hành động này');
    }
}
