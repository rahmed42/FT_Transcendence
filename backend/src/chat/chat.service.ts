import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatDtoAdminOperation, ChatDtoBlockUser, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom, PrivateChatDtoCreateMessage, PrivateChatDtoCreateRoom } from './dto';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { Room } from 'colyseus';

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
				ownerId : body.idUser,
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
        delete room.password;
        return { room: room }
    }



    async joinRoom(body: ChatDtoJoinRoom) {
        const room = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            }
        });
        const user = await this.prisma.user.findFirst({
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
        await this.prisma.user.update({
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
        const users = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            },
            select: {
                users: true,
            },
        });
        const messages = await this.prisma.room.findFirst({
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
        const room = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            }
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            }
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toInvite = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        const updatedUser = await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
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
        const room = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            },
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toKick = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
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
                owner: toKick,
            },
        });
        const isKickedUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        const isKickedUserMuted = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                mutedUsers: {
                    some: {
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
                    },
                },
                invitedUsers: {
                    disconnect: {
                        login: body.loginUserToExecute,
                    },
                },
                administrators: isKickedUserAdmin ? {} : {
                    disconnect: {
                        login: body.loginUserToExecute,
                    },
                },
                mutedUsers: isKickedUserMuted ? {} : {
                    disconnect: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        const updatedUser = await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
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
        const room = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
            }
        });
        if (!room) {
            throw new BadRequestException('Room does not exist');
        }
        const user = await this.prisma.user.findFirst({
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
        const roomInfo = await this.prisma.room.findFirst({
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
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user)
        {
            throw new BadRequestException('User does not exist');
        }
        const roomsOfUser = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
            select : {
                rooms : {
                    select : {
                        name : true,
                    },
                },
            },
        });
        return roomsOfUser;
    }

    async banUser(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        if (!admin) {
            throw new BadRequestException('User does not exist');
        }
        const toBan = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!toBan) {
            throw new BadRequestException('User to ban does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
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
                owner: toBan,
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        const isBannedUserMuted = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                mutedUsers: {
                    some: {
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
                    },
                },
                bannedUsers: {
                    connect: {
                        login: body.loginUserToExecute,
                    },
                },
                users: {
                    disconnect : {
                        login : body.loginUserToExecute,
                    }
                },
                invitedUsers : {
                    disconnect : {
                        login : body.loginUserToExecute,
                    }
                },
                administrators: isBannedUserAdmin ? {} : {
                    disconnect: {
                        login: body.loginUserToExecute,
                    }
                },
            },
        });
        await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
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
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
            // change owner by the next admin or if no admin by the next user
            let nextUser;
            const nextAdmin = await this.prisma.room.findFirst({
                where: {
                    name: body.roomName,
                    administrators: {
                        some: {
                            id: {
                                not: body.idUser,
                            },
                        },
                    },
                },
            });
            if (!nextAdmin)
            {
                nextUser = await this.prisma.room.findFirst({
                    where: {
                        name: body.roomName,
                        users: {
                            some: {
                                id: {
                                    not: body.idUser,
                                },
                            },
                        },
                    },
                });
                if (!nextUser)
                {
                    await this.prisma.room.delete({
                        where: {
                            name: body.roomName,
                        },
                    });
                    return { message: "Room successfully deleted" }
                }
            }
            const updatatedRoom = await this.prisma.room.update({
                where: {
                    name: body.roomName,
                },
                data : {
                    ownerId : nextUser.id,
                }
            });
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
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!admin) {
            throw new BadRequestException('Admin does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
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
    async removeAdmin(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!admin) {
            throw new BadRequestException('Admin does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        const isAdminOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                owner: {
                    login: body.loginUserToExecute,
                },
            },
        });
        if (isAdminOwner) {
            throw new BadRequestException('User is owner');
        }
        if (!isUserAdmin) {
            throw new BadRequestException('User is not admin');
        }
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                administrators: {
                    disconnect: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
            },
            data: {
                administratedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully removed admin" }
    }
    async giveOwner(body: ChatDtoAdminOperation)
    {
        const owner = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!owner) {
            throw new BadRequestException('Owner does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (!isUserInRoom) {
            throw new BadRequestException('User not in room');
        }
        const isOwnerOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                ownerId: body.idAdmin,
            },
        });
        if (!isOwnerOwner) {
            throw new BadRequestException('User is not owner');
        }
        const isUserOwner = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                ownerId: user.id,
            },
        });
        const isUserAdmin = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                administrators: {
                    some: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (isUserOwner) {
            throw new BadRequestException('User is already owner');
        }
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                ownerId: user.id,
                administrators : (!isUserAdmin) ? {} : {
                    connect: {
                        login: body.loginUserToExecute,
                    },
                }

            },
        });
        await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
            },
            data: {
                ownedRooms: {
                    connect: {
                        name: body.roomName,
                    },
                },
                administratedRooms : (!isUserAdmin) ? {} : {
                    connect: {
                        name: body.roomName,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: body.idAdmin,
            },
            data: {
                ownedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
                administratedRooms : {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully given owner" }
    }
    async removeInvite(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!admin) {
            throw new BadRequestException('User who remove invite does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (isUserInRoom) {
            throw new BadRequestException('User has already accepted invitation in room');
        }
        const isUserInvited = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                invitedUsers: {
                    some: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (!isUserInvited) {
            throw new BadRequestException('User is not invited in room');
        }
        if (body.idAdmin == user.id)
        {
            await this.prisma.room.update({
                where: {
                    name: body.roomName,
                },
                data: {
                    invitedUsers: {
                        disconnect: {
                            login: body.loginUserToExecute,
                        },
                    },
                },
            });
            await this.prisma.user.update({
                where: {
                    login: body.loginUserToExecute,
                },
                data: {
                    invitedRooms: {
                        disconnect: {
                            name: body.roomName,
                        },
                    },
                },
            });
            return { message: "User successfully removed invite" }
        }
        else
        {
            throw new BadRequestException('Only user can remove his own invite');
        }
    }
    async unbanUser(body: ChatDtoAdminOperation)
    {
        const admin = await this.prisma.user.findFirst({
            where: {
                id: body.idAdmin,
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                login: body.loginUserToExecute,
            },
        });
        if (!user) {
            throw new BadRequestException('User does not exist');
        }
        if (!admin) {
            throw new BadRequestException('User who unban does not exist');
        }
        const room = await this.prisma.room.findFirst({
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
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (isUserInRoom) {
            throw new BadRequestException('User is in room');
        }
        const isUserBanned = await this.prisma.room.findFirst({
            where: {
                name: body.roomName,
                bannedUsers: {
                    some: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        if (!isUserBanned) {
            throw new BadRequestException('User is not banned in room');
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
        await this.prisma.room.update({
            where: {
                name: body.roomName,
            },
            data: {
                bannedUsers: {
                    disconnect: {
                        login: body.loginUserToExecute,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                login: body.loginUserToExecute,
            },
            data: {
                bannedRooms: {
                    disconnect: {
                        name: body.roomName,
                    },
                },
            },
        });
        return { message: "User successfully unbanned" }
    }
    async createPrivateRoom(body: PrivateChatDtoCreateRoom)
    {
        const uniqueId = uuidv4();
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user)
        {
            throw new BadRequestException('User does not exist');
        }
        const user2 = await this.prisma.user.findFirst({
            where: {
                login: body.loginReceiver,
            },
        });
        if (!user2 || !user2.id)
        {
            throw new BadRequestException('User who try to send message does not exist');
        }
        const privateRoom = await this.prisma.privateRoom.create({
            data : {
                id: uniqueId,
                users: {
                    connect: [
                        {
                            id: body.idUser,
                        },
                        {
                            id: user2.id,
                        },
                    ],
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: body.idUser,
            },
            data: {
                privateRoom: {
                    connect: {
                        id: uniqueId,
                    },
                },
            },
        });
        await this.prisma.user.update({
            where: {
                id: user2.id,
            },
            data: {
                privateRoom: {
                    connect: {
                        id: uniqueId,
                    },
                },
            },
        });
        return { message: "Private room successfully created" }
    }
    async addMessageToPrivateRoom(body : PrivateChatDtoCreateMessage)
    {
        const userReceiver = await this.prisma.user.findFirst({
            where: {
                login: body.loginReceiver,
            },
        });
        const privateRoom = await this.prisma.privateRoom.findFirst({
            where : {
                users: {
                    every: {
                        id: {
                            in: [body.idSender, userReceiver.id],
                        },
                    },
                }
            }
        });
        const message = await this.prisma.message.create({
            data: {
                content: body.content,
                sender: {
                    connect: {
                        id: body.idSender,
                    },
                },
                privateRoom: {
                    connect: {
                        id: privateRoom.id,
                    },
                },
            },
        });
        await this.prisma.privateRoom.update({
            where: {
                id: privateRoom.id,
            },
            data: {
                messages: {
                    connect: {
                        id: message.id,
                    },
                },
            },
        });
        return { message: "Message successfully added" }
    }
    async getPrivateRooms(body: ChatDtoGetRoom)
    {
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user)
        {
            throw new BadRequestException('User does not exist');
        }
        const privateRooms = await this.prisma.privateRoom.findMany({
            where: {
                users: {
                    some: {
                        id: body.idUser,
                    },
                },
            },
            select: {
                id : true,
                users: {
                    select: {
                        id: true,
                        login: true,
                    },
                },
            }
        });
        return privateRooms;
    }
    async getPrivateRoomInfo(body: ChatDtoGetRoom)
    {
        if (!body.roomName)
            throw new BadRequestException('Room name is required');
        const privateRoom = await this.prisma.privateRoom.findFirst({
            where: {
                id: body.roomName,
            },
            select: {
                id: true,
                users : {
                    select : {
                        id: true,
                        login: true,
                    }
                },
                messages: {
                    select : {
                        content: true,
                        sender: {
                            select : {
                                login: true,
                            }
                        },
                    }
                },
            }
        });
        if (!privateRoom)
            throw new BadRequestException('Room does not exist');
        const user = await this.prisma.user.findFirst({
            where: {
                id: body.idUser,
            },
        });
        if (!user)
        {
            throw new BadRequestException('User does not exist');
        }
        const userInRoom = await this.prisma.privateRoom.findFirst({
            where: {
                id: body.roomName,
                users: {
                    some: {
                        id: body.idUser,
                    },
                },
            },
        });
        if (!userInRoom)
        {
            throw new BadRequestException('User is not in room');
        }
        return privateRoom;
    }
	async blockUser(body: ChatDtoBlockUser)
	{
		const user = await this.prisma.user.findFirst({
			where: {
				id: body.idUser,
			},
		});
		if (!user)
			throw new BadRequestException('User does not exist');
		const userToBlock = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToBlock,
			},
		});
		if (!userToBlock)
			throw new BadRequestException('User to block does not exist');
		if (user.id == userToBlock.id)
			throw new BadRequestException('You cannot block yourself');
		const isAlreadyBlocked = await this.prisma.user.findFirst({
			where: {
				id: body.idUser,
				blockedUsers: {
					some: {
						login: body.loginUserToBlock,
					},
				},
			},
		});
		if (isAlreadyBlocked)
			throw new BadRequestException('User is already blocked');
		await this.prisma.user.update({
			where: {
				id: body.idUser,
			},
			data: {
				blockedUsers: {
					connect: {
						login: body.loginUserToBlock,
					},
				},
			},
		});
		return { message: "User successfully blocked" }
	}
	async unblockUser(body: ChatDtoBlockUser)
	{
		const user = await this.prisma.user.findFirst({
			where: {
				id: body.idUser,
			},
		});
		if (!user)
			throw new BadRequestException('User does not exist');
		const userToUnblock = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToBlock,
			},
		});
		if (!userToUnblock)
			throw new BadRequestException('User to unblock does not exist');
		if (user.id == userToUnblock.id)
			throw new BadRequestException('You cannot unblock yourself');
		const isBlocked = await this.prisma.user.findFirst({
			where: {
				id: body.idUser,
				blockedUsers: {
					some: {
						login: body.loginUserToBlock,
					},
				},
			},
		});
		if (!isBlocked)
			throw new BadRequestException('User is not blocked');
		await this.prisma.user.update({
			where: {
				id: body.idUser,
			},
			data: {
				blockedUsers: {
					disconnect: {
						login: body.loginUserToBlock,
					},
				},
			},
		});
		return { message: "User successfully unblocked" }
	}
	async muteUser(body: ChatDtoAdminOperation)
	{
		const user = await this.prisma.user.findFirst({
			where: {
				id: body.idAdmin,
			},
		});
		if (!user)
			throw new BadRequestException('User does not exist');
		const userToMute = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToExecute,
			},
		});
		const room = await this.prisma.room.findFirst({
			where: {
				name: body.roomName,
			},
		});
		if (!room)
			throw new BadRequestException('Room does not exist');
		if (!userToMute)
			throw new BadRequestException('User to mute does not exist');
		if (user.id == userToMute.id)
			throw new BadRequestException('You cannot mute yourself');
		const isAlreadyMuted = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToExecute,
				mutedRooms: {
					some: {
						name: body.roomName,
					},
				},
			},
		});
		if (isAlreadyMuted)
			throw new BadRequestException('User is already muted');
		const isUserAdmin = await this.prisma.user.findFirst({
			where: {
				id: body.idAdmin,
				administratedRooms: {
					some: {
						name: body.roomName,
					},
				},
			},
		});
		if (!isUserAdmin)
			throw new BadRequestException('You are not admin of this room');
		if (room.ownerId == userToMute.id)
			throw new BadRequestException('You cannot mute owner of the room');
		await this.prisma.user.update({
			where: {
				login: body.loginUserToExecute,
			},
			data: {
				mutedRooms: {
					connect: {
						name: body.roomName,
					},
				},
			},
		});
		return { message: "User successfully muted" }
	}
	async unmuteUser(body: ChatDtoAdminOperation)
	{
		const user = await this.prisma.user.findFirst({
			where: {
				id: body.idAdmin,
			},
		});
		if (!user)
			throw new BadRequestException('User does not exist');
		const userToUnmute = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToExecute,
			},
		});
		const isUserAdmin = await this.prisma.user.findFirst({
			where: {
				id: body.idAdmin,
				administratedRooms: {
					some: {
						name: body.roomName,
					},
				},
			},
		});
		if (!isUserAdmin)
			throw new BadRequestException('You are not admin of this room');
		if (!userToUnmute)
			throw new BadRequestException('User to unmute does not exist');
		if (user.id == userToUnmute.id)
			throw new BadRequestException('You cannot unmute yourself');
		const isMuted = await this.prisma.user.findFirst({
			where: {
				login: body.loginUserToExecute,
				mutedRooms: {
					some: {
						name: body.roomName,
					},
				},
			},
		});
		if (!isMuted)
			throw new BadRequestException('User is not muted');
		await this.prisma.user.update({
			where: {
				login: body.loginUserToExecute,
			},
			data: {
				mutedRooms: {
					disconnect: {
						name: body.roomName,
					},
				},
			},
		});
		return { message: "User successfully unmuted" }
	}
}
