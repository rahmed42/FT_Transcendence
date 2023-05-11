import { ConsoleLogger, Controller, Get, Post, Query, Response, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import axios from 'axios';

const dotenv = require('dotenv');
dotenv.config();

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService)  {}
	@Post('token')
	async getToken(@Query('code') code: string) {
		const payload = {
			grant_type: process.env.GRANT_TYPE,
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code,
			redirect_uri: process.env.REDIRECT_URI,
		};
		const response = await axios.post('https://api.intra.42.fr/oauth/token', payload, {
			headers: { 'Content-Type': 'application/json' },
		});
		const token = response.data.access_token;
		const headers = {
			'Authorization': 'Bearer ' + token,
		};
		const data = await axios.get("https://api.intra.42.fr/v2/me",  { headers });
		const user = {
			id: data.data.id,
		}
		console.log(user);
	}
}
