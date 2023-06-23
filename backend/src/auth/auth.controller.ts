import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('login')
		async login(@Req() request: Request) {
			const token = request.cookies;
			return await this.authService.loginUser(token);
		}
	@Post('logout')
	async logout(@Req() request: Request) {
		const token = request.cookies;
		return await this.authService.logoutUser(token);
	}
	@Post('in_game')
	async update_status(@Req() request: Request) {
		const token = request.cookies;
		return await this.authService.inGameUser(token);
	}
	@Post('userInfo')
		async getUserInfo(@Query('code') code: string, @Req() request: Request) {
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
			let otpUrl;
			let qrcode;
			const secret = await this.authService.check_secret(token);
			if (!secret) {
				otpUrl = await this.authService.generate_secret(token);
				qrcode = await this.authService.generate_qrCode(otpUrl);
			}
			return { qrcode }
		}
	@Post('2fa_code')
		async check_code(@Req() request: Request, @Body() body: any) {
			const code = body.code;
			const token = request.cookies;
			const valide = await this.authService.isCodeValid(code, token);
			return { valide };
		}
	@Get('2fa_info')
		async ckeck_2fa_info(@Req() request: Request) {
			const token = request.cookies;
			const info = await this.authService.get_2fa_info(token);
			return { info }
		}
}