import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}
        async getInfo(tokenObject: { jwt: string }) {
            const decode = await this.jwt.decode(tokenObject.jwt);
            if (typeof decode === 'object')
            {
                const user = await this.prisma.user.findUnique({
                    where: {
                        id: decode.id,
                    },
                })
                return user;
            }
        }
        async getFriendInfo(username: string) {
                const user = await this.prisma.user.findUnique({
                    where: {
                        login: username,
                    },
                })
                return user;
        }
        async upload_pp(tokenObject: {jwt:string }, body: any) {
            const decode = await this.jwt.decode(tokenObject.jwt);
            if (typeof decode === 'object')
            {
                await this.prisma.user.update({
                    where: {
                        id: decode.id,
                    },
                    data : {
                        avatar: body.data,
                    }
                })
            }
        }
    async upload_username(tokenObject: { jwt: string }, body: any) {
        const decode = await this.jwt.decode(tokenObject.jwt);
        if (typeof decode === 'object') {
            await this.prisma.user.update({
                where: {
                    id: decode.id,
                },
                data: {
                    login: body.data,
                }
            })
        }
    }
    async update_user_stats(body: any) {
        if (body.myScore > 2)
        {
            await this.prisma.matchHistory.create({
                data : {
                    userId: body.currentUser.id,
                    myScore: body.myScore,
                    opponentName: body.opponentName,
                    opponentScore: body.opponentScore,
                    gameType: "original",
                    result : "win",
                }
            })
            await this.prisma.stats.update({
                where: {
                    userId: body.currentUser.id,
                },
                data: {
                    wins: {
                        increment: 1,
                    }
                }
            })
        }
        else
        {
            await this.prisma.matchHistory.create({
                data: {
                    userId: body.currentUser.id,
                    opponentName: body.opponentName,
                    opponentScore: body.opponentScore,
                    gameType: "original",
                    result: "loose",
                }
            })
            await this.prisma.stats.update({
                where: {
                    userId: body.currentUser.id,
                },
                data: {
                    losses: {
                        increment: 1,
                    }
                }
            })
        }
        const userMatches = await this.prisma.user.findUnique({
            where: { login: body.currentUser.login },
        }).matchHistory();

        console.log(userMatches);
    }
}
