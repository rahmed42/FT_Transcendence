import { Injectable } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios'
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}
    async getUser(code: string) {
        // Check if the URL code was already used once, if not
        // This is done for dodge making request twice with the same URL code (API return error)
        // I can probably avoid doing this later by using JWT Token form the request
        const check_code = await this.prisma.data.findUnique({
            where: {
                code,
            }
        })
        if (!check_code) // handle refresh browser with the same URL code
        {
            const payload = {
                grant_type: process.env.GRANT_TYPE,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                redirect_uri: process.env.REDIRECT_URI,
            };
            // Make a POST request to the 42 API with payload object
            const response = await axios.post('https://api.intra.42.fr/oauth/token', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            // Get the Token of the 42 API response
            const token = response.data.access_token;
            // Make a GET request to the API to trade Token VS User Informations
            const data = await axios.get("https://api.intra.42.fr/v2/me", { 
                headers: { 'Authorization': 'Bearer ' + token },
            });
            // Stock all the informations in a user object
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
            // Check if the user ID is already in our DataBase
            const check_id = await this.prisma.user.findUnique({
                where: {
                    id: data.data.id,
                }
            })
            // If not, create it
            if (!check_id)
            {
                    await this.prisma.user.create({
                    data: user,
                });
            }
            // Push the URL code in Data Model of our DataBase
            await this.prisma.data.create({
                data: {
                    code,
                }
            });
            return this.getJwtToken(user);
        }
    }
    async getJwtToken(user: { [key: string]: any }) : Promise<{token: string}> {
        const secret = process.env.JWT_SECRET;
        const token = await this.jwt.signAsync(user, {
            secret,
        });
        await this.prisma.user.update({
            where : {
                id: user.id,
            },
            data : {
                jwtToken: token,
            },
        });
        return {
            token,
        };
    }
    async push_settings(body: any, tokenObject: { jwt: string }) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object')
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                two_fa: body.check,
            },
        })
    }
    async generate_secret(tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        const secret = authenticator.generateSecret();
        if (typeof user === 'object') {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    two_fa_secret: secret,
                }
            });
            const otpUrl = authenticator.keyuri(user.email, 'Transcendance', secret);
            return otpUrl;
        }
    }
    async generate_qrCode(otpUrl: string) {
        return await toDataURL(otpUrl);
    }
    async isCodeValid(two_fa_code: string, tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object') {
            return await authenticator.verify({
                token: two_fa_code,
                secret: user.two_fa_secret,
            });
        }
    }
    async turn_on_2fa(tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object') {
            await this.prisma.user.update({
                where : {
                    id: user.id,
                },
                data : {
                    two_fa_authenticate: true,
                }
            });
        }
    }
}
