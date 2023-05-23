import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatDtoAdminOperation, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom } from './dto';
import * as argon from 'argon2';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }
    
    
    async createRoom(body: ChatDtoCreateRoom) {
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
        if (!body.password) {
            body.password = '';
        }
        const hash = await argon.hash(body.password);
        const room = await this.prisma.room.create({
            data: {
                name: body.roomName,
                password: hash,
                type: body.type,
                messages: {},
                users: {
                    connect: {
                        id: body.idUser,
                    }
                },
                owner: {
                    connect: {
                        id: body.idUser,
                    }
                },
                invitedUsers: {
                    connect: {
                        id: body.idUser,
                    }
                },
                administrators: {
                    connect: {
                        id: body.idUser,
                    }
                },
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
                rooms: {
                    connect: {
                        name: room.name,
                    },
                },
                administratedRooms: {
                    connect: {
                        name: room.name,
                    },
                },
                invitedRooms: {
                    connect: {
                        name: room.name,
                    },
                },
            },
        });
        delete room.password;
        return { room: room }
    }

    
    
    async joinRoom(body: ChatDtoJoinRoom) {
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            }
        });
        const user = await this.prisma.user.findUnique({
            where: {
                id: body.idUser,
            }
        })
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (room.type == "protected" && !body.password) {
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
        if (!invited && room.type == "private") {
            throw new BadRequestException('User not invited to private room');
        }
        if (room.type == "protected") {
            let pwMatches = await argon.verify(room.password, body.password);
            if (!pwMatches) {
                throw new BadRequestException('Invalid password');
            }
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
        const isBan = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                bannedUsers: {
                    some: {
                        id: body.idUser,
                    }
                },
            },
        });
        if (userInRoom) {
            throw new BadRequestException('User already in room');
        }
        if (isBan) {
            throw new BadRequestException('User is banned from room');
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
        return { room: updatedRoom, users: users.users, messages: messages.messages };
    }
    
    
    
    
    async inviteUser(body: ChatDtoAdminOperation) {
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            }
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const admin = await this.prisma.user.findUnique({
            where: {
                id: body.idAdmin,
            }
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toInvite = await this.prisma.user.findUnique({
            where: {
                id: body.idUserToExecute,
            }
        });
        if (!toInvite) {
            throw new BadRequestException('User to invite does not exist');
        }
        const isAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idAdmin,
                    }
                },
            },
        });
        if (!isAdmin) {
            throw new BadRequestException('User is not admin');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUserToExecute,
                    }
                }
            },
        });
        if (isUserInRoom) {
            throw new BadRequestException('User already in room');
        }
        const updatedRoom = await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                invitedUsers: {
                    connect: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        const updatedUser = await this.prisma.user.update({
            where: {
                id: body.idUserToExecute,
            },
            data: {
                invitedRooms: {
                    connect: {
                        name: body.roomName,
                    },
                },
            },
        });
        delete updatedRoom.password;
        return { message: "User successfully invited" }
    }
    async kickUser(body: ChatDtoAdminOperation) {
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const admin = await this.prisma.user.findUnique({
            where: {
                id: body.idAdmin,
            },
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toKick = await this.prisma.user.findUnique({
            where: {
                id: body.idUserToExecute,
            },
        });
        if (!toKick) {
            throw new BadRequestException('User to kick does not exist');
        }
        const isAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idAdmin,
                    },
                },
            },
        });
        if (!isAdmin) {
            throw new BadRequestException('User is not admin');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        const isKickedUserOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                ownerId: body.idUserToExecute,
            },
        });
        const isKickedUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        const isKickedUserMuted = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                mutedUsers: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (isKickedUserOwner) {
            throw new BadRequestException('User is owner of room');
        }
        const updatedRoom = await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                users: {
                    disconnect: {
                        id: body.idUserToExecute,
                    },
                },
                invitedUsers: {
                    disconnect: {
                        id: body.idUserToExecute,
                    },
                },
                administrators: isKickedUserAdmin ? {} : {
                    disconnect: {
                        id: body.idUserToExecute,
                    },
                },
                mutedUsers: isKickedUserMuted ? {} : {
                    disconnect: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        const updatedUser = await this.prisma.user.update({
            where: {
                id: body.idUserToExecute,
            },
            data: {
                rooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                invitedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                administratedRooms: isKickedUserAdmin ? {} : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                mutedRooms: isKickedUserMuted ? {} : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully kicked " }
    }
    
    
    
    async getRoomInfo(body: ChatDtoGetRoom) {
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            }
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const user = await this.prisma.user.findUnique({
            where: {
                id: body.idUser,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUser,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        //select roominfo with users administrators message and mutedusers but without password and token in user table
        const roomInfo = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
            select: {
                name: true,
                ownerId: true,
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        id: true,
                        login: true,
                        large_pic: true,
                        small_pic: true,
                        medium_pic: true,
                    },
                },
                administrators: {
                    select: {
                        id: true,
                        login: true,
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                    },
                },
                mutedUsers: {
                    select: {
                        id: true,
                        login: true,
                    },
                },
                bannedUsers: {
                    select: {
                        id: true,
                        login: true,
                    },
                },
            },
        });
        return roomInfo;
    }


    async getRooms(body: ChatDtoGetRoom)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                id: body.idUser,
            },
        });
        if (!user) 
        {
            throw new BadRequestException('User does not exist');
        }
        const roomsOfUser = await this.prisma.user.findUnique({
            where: {
                id: body.idUser,
            },
            select : {
                rooms : {
                    select : {
                        id : true,
                        name : true,
                        type : true,
                    },
                },
            },
        });
        return {"userId": user.id, "rooms" : roomsOfUser}
    }

    async banUser(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findUnique({
            where: {
                id: body.idAdmin,
            },
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toBan = await this.prisma.user.findUnique({
            where: {
                id: body.idUserToExecute,
            },
        });
        if (!toBan) {
            throw new BadRequestException('User to ban does not exist');
        }
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const isAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idAdmin,
                    },
                },
            },
        });
        if (!isAdmin) {
            throw new BadRequestException('User is not admin');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        const isBanned = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                bannedUsers: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (isBanned) {
            throw new BadRequestException('User already banned');
        }
        const isBannedUserOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                ownerId: body.idUserToExecute,
            },
        });
        if (isBannedUserOwner) {
            throw new BadRequestException('User is owner of room');
        }
        const isBannedUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        const isBannedUserMuted = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                mutedUsers: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                mutedUsers: isBannedUserMuted ? {} : {
                    disconnect: {
                        id: body.idUserToExecute,
                    },
                },
                bannedUsers: {
                    connect: {
                        id: body.idUserToExecute,
                    },
                },
                users: {
                    disconnect : {
                        id : body.idUserToExecute,
                    }
                },
                invitedUsers : {
                    disconnect : {
                        id : body.idUserToExecute,
                    }
                },
                administrators: isBannedUserAdmin ? {} : {
                    disconnect: {
                        id: body.idUserToExecute,
                    }
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: body.idUserToExecute,
            },
            data: {
                rooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                administratedRooms: isBannedUserAdmin ? {} : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                mutedRooms: isBannedUserMuted ? {} : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                invitedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        })
        return { message: "User successfully banned" }
    }
    async leaveRoom(body: ChatDtoJoinRoom)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                id: body.idUser,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUser,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        const isUserOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                ownerId: body.idUser,
            },
        });
        if (isUserOwner) {
            throw new BadRequestException('User is owner of room');
        }
        const isUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idUser,
                    },
                },
            },
        });
        const isUserMuted = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                mutedUsers: {
                    some : {
                        id : body.idUser,
                    },
                },
            },
        });
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data : {
                mutedUsers : isUserMuted ? {} : {
                    disconnect : {
                        id : body.idUser,
                    },
                },
                users: {
                    disconnect: {
                        id: body.idUser,
                    },
                },
                invitedUsers: {
                    disconnect: {
                        id: body.idUser,
                    },
                },
                administrators: isUserAdmin ? {} : {
                    disconnect: {
                        id: body.idUser,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: body.idUser,
            },
            data: {
                rooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                administratedRooms: isUserAdmin ? {} : {
                    disconnect: {
                        name: body.roomName,    
                    },
                },
                mutedRooms: isUserMuted ? {} : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                invitedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully left room" }
    }
    async giveAdmin(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findUnique({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findUnique({
            where: {
                id: body.idUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!admin) {
            throw new BadRequestException('Admin does not exist');
        }
        const room = await this.prisma.room.findUnique({
            where: {
                name: body.roomName,
            },
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const isUserInRoom = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                users: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        const isAdminAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idAdmin,
                    },
                },
            },
        });
        if (!isAdminAdmin) {
            throw new BadRequestException('User is not admin');
        }
        const isUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        if (isUserAdmin) {
            throw new BadRequestException('User is already admin');
        }
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                administrators: {
                    connect: {
                        id: body.idUserToExecute,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: body.idUserToExecute,
            },
            data: {
                administratedRooms: {
                    connect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully given admin" }
    }
}

