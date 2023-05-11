import { Injectable, Query } from '@nestjs/common';
import axios from 'axios'

@Injectable()
export class AuthService {
    async getToken(code: string) {
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
        const data = await axios.get("https://api.intra.42.fr/v2/me", { headers });
        const user = {
            id: data.data.id,
            email: data.data.email,
            login: data.data.login,
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            large_pic: data.data.image.versions.large,
            medium_pic: data.data.image.versions.medium,
            small_pic: data.data.image.versions.small,
        }
        return user;
    }
}
