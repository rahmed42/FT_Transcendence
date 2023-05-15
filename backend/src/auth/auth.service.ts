import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import axios from 'axios'
import { userInfo } from 'os';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}
    async getUser(code: string) {
        const check_code = await this.prisma.data.findUnique({
            where: {
                code,
            }
        })
        if (check_code)
            return {};
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
        const data = await axios.get("https://api.intra.42.fr/v2/me", { 
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const user = {
            token,
            id: data.data.id,
            email: data.data.email,
            login: data.data.login,
            first_name: data.data.first_name,
            last_name: data.data.last_name,
            large_pic: data.data.image.versions.large,
            medium_pic: data.data.image.versions.medium,
            small_pic: data.data.image.versions.small,
        }
        const check_id = await this.prisma.user.findUnique({
            where: {
                id: data.data.id,
            }
        })
        if (!check_id)
        {
                await this.prisma.user.create({
                data: user,
            });
        }
        await this.prisma.data.create({
            data: {
                code,
            }
        });
        return user;
    }
}
