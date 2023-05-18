import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('login')
		async login(@Query('code') code: string, @Req() request: Request) {
			// console.log('Request cookie: ', request.cookies); !Debug
			// console.log(code);
			const token = await this.authService.getUser(code);
			return token;
		}
}

// @Controller('profil')
// export class UserController {
// 	constructor(private userService: UserService) {}
// 		@Get('me')
// 			fct() {
// 				console.log('here back');
// 			}
// 		// async getUserInfo(@Req() request: Request) {
// 				// const token = request.cookies;
// 				// await this.userService.getInfo(token);
// 		}
