import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }
	// @Get('login') => go to home page
	@Get('')
	login() {
		return this.authService.login();
	}

	// @Get('logout') => go to new login page
	@Get('auth')
		logout() {
		return this.authService.logout();
	}
}

