import { Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('login')
		async login(@Query('code') code: string, @Req() request: Request) {
			// console.log('Request cookie: ', request.cookies); !Debug
			const token = await this.authService.getUser(code);
			// console.log(token);
			return token;
		}
}
