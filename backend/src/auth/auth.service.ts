import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	login() {
		const credentials = {
			client : {
				id: 'u-s4t2ud-3c2796a2403e6bb0730f6aaad079b397f30f1351f98a0843a96609c201728d58',
				secret: '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',
			},
			auth: {
				tokenHost : 'https://api.intra.42.fr',
			},
		}

		const isUserLoggedIn = false;
		const userName = '*Default*';

		//redirect URI :
		// http://localhost:5173/profile

		// URL :
		// https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3c2796a2403e6bb0730f6aaad079b397f30f1351f98a0843a96609c201728d58&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fprofile&response_type=code

		// const oauth2 = require('simple-oauth2').create(credentials);

	}
	logout() {
		return ("LOGOUT from AuthService");
	}
}
