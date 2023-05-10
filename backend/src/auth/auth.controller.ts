import { ConsoleLogger, Controller, Get, Query, Response, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }
	// @Get('login') => go to home page
	@Get('token')
	login(@Query() code: string) {
		console.log(code);
	}

	// // @Get('logout') => go to new login page
	// @Get('auth')
	// 	logout() {
	// 	return this.authService.logout();
	// }
}

