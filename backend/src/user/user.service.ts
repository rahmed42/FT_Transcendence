import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}
        async getInfo(token: string) {
            console.log('token in userService:' , token);
        }
}
