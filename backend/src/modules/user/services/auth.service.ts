import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto } from 'src/modules/user/dtos/auth.dto';
import { UserService } from '../../../modules/user/services/user.service';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private userService: UserService) { }

   async register(requestBody: RegisterUserDto) {
        //check email đã tồn tại chưa
        const userByEmail = await this.userService.findByEmail(requestBody.email);
        if (userByEmail) {
            throw new BadRequestException('Email đã tồn tại');
        }

        //hash password
        const hashedPassword = await bcrypt.hash(requestBody.password, 10);
        requestBody.password = hashedPassword;

        //save to db
        const savedUser = await this.userService.create(requestBody);

        //create token
        const payload = {
            id: savedUser.id,
            email: savedUser.email,
            fullName: savedUser.fullName,
            role: savedUser.role,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET
        });

        return {
            msg: 'Đăng ký thành công',
            accessToken,
        };


    }

    async login(requestBody: LoginUserDto) {
        //check email đã tồn tại chưa
        const userByEmail = await this.userService.findByEmail(requestBody.email);
        if (!userByEmail) {
            throw new BadRequestException('Email không tồn tại');
        }
        //check password
        const isMatch = await bcrypt.compare(requestBody.password, userByEmail.password);
        if (!isMatch) {
            throw new BadRequestException('Mật khẩu không đúng');
        }
        const payload = {
            id: userByEmail.id,
            email: userByEmail.email,
            fullName: userByEmail.fullName,
            role: userByEmail.role,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET
        });
        
        return {
            msg: 'Đăng nhập thành công',
            accessToken,
        };

    }  

}
