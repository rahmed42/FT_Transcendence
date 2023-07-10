import { Injectable } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios'
import { authenticator } from 'otplib';
import { PrismaService } from 'src/prisma/prisma.service';
import { userInfo } from 'os';


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
                await this.prisma.stats.create({
                    data: {
                        userId: user.id,
                    }
                })
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
    async loginUser(tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null)
        {
            await this.prisma.user.update({
                where : {
                    id: user.id
                },
                data: {
                    status: "login",
                }
            })
        }
    }
    async logoutUser(tokenObject: { jwt: string }) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null) {
            await this.prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    status: "logout",
                }
            })
        }
    }
    async inGameUser(tokenObject: { jwt: string }) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null) {
            await this.prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    status: "ingame",
                }
            })
        }
    }

    // if the User want 2fa on his account, update a variable in his User Model
    async push_settings(body: any, tokenObject: { jwt: string }) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null)
        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                two_fa: body.check,
            },
        })
    }
    async check_secret(tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null) {
            const check = await this.prisma.user.findUnique({
                where: {
                    id: user.id,
                }
            })
            if (check.two_fa_secret)
                return true;
        }
        return false;
    }
    // generate a authentification secret and push it on User Model
    async generate_secret(tokenObject: {jwt: string}) {
        const user = await this.jwt.decode(tokenObject.jwt);
        const secret = authenticator.generateSecret();
        if (typeof user === 'object' && user.id !== null) {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    two_fa_secret: secret,
                }
            });
            // generate a Url based on user email and secret generate last step
            const otpUrl = authenticator.keyuri(user.email, 'Transcendance', secret);
            return otpUrl;
        }
    }
    // generate the qrCode based on the Url
    async generate_qrCode(otpUrl: string) {
        return await toDataURL(otpUrl);
    }
    // check if the code provided by the User match the secret
    async isCodeValid(code: string, tokenObject: {jwt: string}) {
        let newUser;
        const user = await this.jwt.decode(tokenObject.jwt);
        if (typeof user === 'object' && user.id !== null) {
            newUser = await this.prisma.user.findUnique({
                where: {
                    id : user.id,
                }
            })
        }
        if (typeof user === 'object') {
            return await authenticator.verify({
                token: code,
                secret: newUser.two_fa_secret,
            });
        }
    }
    async get_2fa_info(tokenObject: {jwt : string}) {
        const decode = await this.jwt.decode(tokenObject.jwt);
        if (typeof decode === 'object' && decode.id !== null)
        {
            const user  = await this.prisma.user.findUnique({
                where: {
                    id: decode.id,
                }
            })
            if (user.two_fa)
                return user.two_fa;
        }
    }
    async get_2fa_once(tokenObject: {jwt : string}) {
        const decode = await this.jwt.decode(tokenObject.jwt);
        if (typeof decode === 'object' && decode.id !== null)
        {
            const result = await this.prisma.user.findUnique({
                where: {
                    id: decode.id,
                },
            })
            if (result.two_fa_once)
                return (true);
        }
        return (false);
    }
    async post_2fa_true(tokenObject: {jwt : string}) {
        const decode = await this.jwt.decode(tokenObject.jwt);
        if (typeof decode === 'object' && decode.id !== null)
        {
            await this.prisma.user.update({
                where: {
                    id: decode.id,
                },
                data : {
                    two_fa_once: true,
                }
            })
        }
    }
}
