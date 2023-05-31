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
}
