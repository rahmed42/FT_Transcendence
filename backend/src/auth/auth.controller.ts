import { Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import axios from 'axios';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('token')
		async login(@Query('code') code: string) {
			const user = await this.authService.getToken(code);
			console.log(user);
		}
}
