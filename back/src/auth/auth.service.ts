import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
	login() {
		const credentials = {
			client : {
				id: 'u-s4t2ud-2f818a332a9a2006b00174a76ce71efe9e374cc942b996040f79806509ce968d',
				secret: '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',
			},
			auth: {
				tokenHost : 'https://api.intra.42.fr',
			},
		}
		const oauth2 = require('simple-oauth2').create(credentials);
		
	}
	logout() {
		return ("LOGOUT from AuthService");
	}
}