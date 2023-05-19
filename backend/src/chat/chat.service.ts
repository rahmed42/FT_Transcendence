import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatDtoCreateRoom, ChatDtoJoinRoom } from './dto';
import * as argon from 'argon2';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}
    async createRoom(body : ChatDtoCreateRoom)
    {
        const roomExists = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            },
        });
        if (roomExists) {
            throw new BadRequestException('Room already exists');
        }
        if (body.type != "public" && body.type != "private" && body.type != "protected") {
            throw new BadRequestException('Invalid room type');
        }
        if (body.type == "protected" && !body.password) {
            throw new BadRequestException('Password required for protected room');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        const hash = await argon.hash(body.password);
        const room = await this.prisma.room.create({
            data: {
                name: body.roomName,
                password: hash,
                type: body.type,
                messages : {},
                users: {},
                owner : {
                    connect : {
                        id : body.idUser,
                    }
                },
                invitedUsers: {},
                administrators: {},
                bannedUsers: {},
                mutedUsers: {},
            },
        });
        const updatedUser = await this.prisma.user.update({
            where: {
                id: body.idUser,
            },
            data: {
                ownedRooms: {
                    connect: {
                        name: room.name,
                    },
                },
            },
        }); 
        delete room.password;
        return { room: room }
    }

    async joinRoom(body : ChatDtoJoinRoom)
    {
        const room = await this.prisma.room.findUnique({
            where : { 
                name : body.roomName,
            }
        });
        const user = await this.prisma.user.findUnique({
            where : {
                id: body.idUser,
            }
        })
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        if (!user)
        {
            throw new BadRequestException('User does not exist');
        }
        if (room.type == "protected" && !body.password)
        {
            throw new BadRequestException('Password required for protected room');
        }
        // select invitedUsers from room where id = body.idRoom
        let invited = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                invitedUsers: {
                    some: {
                        id: body.idUser,
                    }
                },
            },
        });
        if (!invited && room.type == "private")
        {
            throw new BadRequestException('User not invited to private room');
        }
        let pwMatches = await argon.verify(room.password, body.password);
        if (!pwMatches && room.type == "protected")
        {
            throw new BadRequestException('Invalid password');
        }
        const userInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUser,
                    }
                },
            },
        });
        if (userInRoom)
        {
            throw new BadRequestException('User already in room');
        }
        const updatedUser = await this.prisma.user.update({
            where: {
                id: body.idUser,
            },
            data: {
                rooms: {
                    connect: {
                        name: body.roomName,
                    },
                },
                invitedRooms: {
                    connect: {
                        name: body.roomName,
                    },
                },
            },
        });
        const updatedRoom = await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                users: {
                    connect: {
                        id: body.idUser,
                    },
                },
            },
        });
        delete updatedRoom.password;
        // select users table 
        const users = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
            select: {
                users: true,
            },
        });
        const messages = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
            select: {
                messages: true,
            },
        });
        return { room: updatedRoom, users: users.users, messages: messages.messages};
    }
}