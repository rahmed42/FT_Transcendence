import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('profil')
export class UserController {
    constructor(private userService: UserService) {}
    @Get('me')
        async getUserInfo(@Req() request: Request) {
        const token = request.cookies;
        await this.userService.getInfo(token);
    }
}
