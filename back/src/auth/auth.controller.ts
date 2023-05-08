import { Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
	constructor(private authService: AuthService) {}
		@Get('/login')
			login() {
				return this.authService.login();
			}
}