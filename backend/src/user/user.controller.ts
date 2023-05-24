import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('profil')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
        async getUserInfo(@Req() request: Request) {
        const token = request.cookies;
        return await this.userService.getInfo(token);
    }
}
