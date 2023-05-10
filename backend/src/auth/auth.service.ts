import { Injectable, Redirect, Res } from '@nestjs/common';

@Injectable()
export class AuthService {
	login() {}

	logout() {
		return ("LOGOUT from AuthService");
	}
}
