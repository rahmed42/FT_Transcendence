import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('login')
		async login(@Query('code') code: string, @Req() request: Request) {
			const token = await this.authService.getUser(code);
			return token;
		}
	@Post('settings')
		async save_settings(@Body() body: any, @Req() request: Request) {
	 		const token = request.cookies;
	 		await this.authService.push_settings(body, token)
	 	}
	@Post('qrcode_generate')
		async generate(@Req() request: Request, @Body() body: any) {
			const token = request.cookies;
			const otpUrl = await this.authService.generate_secret(token);
			const qrcode = await this.authService.generate_qrCode(otpUrl);
			return { qrcode };
		}
	// @Post('two_fa')
		// async generate_two_fa_secret(@Req() request: Request, @Body() body: any) {
		// 	const token = request.cookies;
		// 	const otpUrl = await this.authService.generate_secret(token);
		// 	const qrcode = await this.authService.generate_qrCode(otpUrl);
		// 	const isValidCode = this.authService.isCodeValid(body.code, token);
		// 	if (isValidCode)
		// 		await this.authService.turn_on_2fa(token);
		// 	return qrcode;
		// }
}