import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('profil')
export class UserController {
    constructor(private userService: UserService) {}
    // @UseGuards(AuthGuard('jwt'))
    @Get('me')
        async getUserInfo(@Req() request: Request) {
        const token = request.cookies;
        return await this.userService.getInfo(token);
    }
    @Post('picture')
        async update_pp(@Req() request: Request, @Body() body: any) {
            const token = request.cookies;
            await this.userService.upload_pp(token, body);
            return await this.userService.getInfo(token);
        }
    @Post('username')
    async update_username(@Req() request: Request, @Body() body: any) {
        const token = request.cookies;
        await this.userService.upload_username(token, body);
        return await this.userService.getInfo(token);
    }
}
