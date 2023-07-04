import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
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

    @Get('friends')
    async getFriendInfo(@Query('login') username: string) {
        return await this.userService.getFriendInfo(username);
    }
    @Post('match_stats')
    async update_game_data(@Body() body: any) {
        await this.userService.update_user_stats(body);
    }
    @Post('skins')
    async update_game_skins(@Req() request: Request, @Body() body: any) {
        const token = request.cookies;
        await this.userService.update_choosed_skins(token, body);
    }
    @Post('get_skins')
    async get_user_skins(@Body() body: any) {
        return await this.userService.get_skins(body);
    }
    @Post('inviteGame')
    async inviteToPlay(@Body() body: any) {
        return await this.userService.invitePlayer(body);
    }
}
