import { Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('login')
		async login(@Query('code') code: string) {
			const token = await this.authService.getUser(code);
			console.log(token);
			return token;
		}
}
