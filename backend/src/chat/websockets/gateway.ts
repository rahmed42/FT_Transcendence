import { Body, OnModuleInit } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { PrivateMessageDto, RoomMessageDto } from "../dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatService } from "src/chat/chat.service";

@WebSocketGateway()
export class Gateway implements OnModuleInit {
    
    constructor(private prisma: PrismaService, private chatService : ChatService) {}

    @WebSocketServer()
    server: Server

    onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id)
        });
    }

    async sendMessageToRoom(roomName: string, content: string, idSender: number) {
        const room = await this.prisma.room.findUnique({
            where : {
                name: roomName,
            }
        })
        if (!room)
            return;
        const user = await this.prisma.user.findUnique({
            where : {
                id: idSender,
            },
        });
        if (!user)
            return ;
        const userInRoom = await  this.prisma.user.findFirst({
            where : 
            {
                id: idSender,
                rooms: {
                    some: {
                        name: roomName,
                    }
                }
            }
        })
        if (!userInRoom)
            return ;
        const isUserMuted = await this.prisma.user.findFirst({
            where : {
                id: idSender,
                mutedRooms : {
                    some: {
                        name: roomName,
                    }
                }
            },
        })
        if (isUserMuted)
            return ;
        this.server.to(roomName).emit('newRoomMessage', {
            content: content,
            nameSender: user.login,
            roomName: roomName,
        })
    }
    async sendPrivateMessage(idSender: number, loginReceiver: string, content: string) {
        const user = await this.prisma.user.findUnique({
            where : {
                id: idSender,
            }
        })
        if (!user)
            return ;
        const userReceiver = await this.prisma.user.findUnique({
            where : {
                login: loginReceiver,
            }
        })
        if (!userReceiver)
            return ;
        // find private room where users are idSender and userReceiver.id
        const privateRoom = await this.prisma.privateRoom.findFirst({
            where : {
                users: {
                    every: {
                        id: {
                            in: [idSender, userReceiver.id],
                        },
                    },
                },
            },
        });
        // use /chat/createPrivateRoom POST
        if (!privateRoom)
        {
            await this.chatService.createPrivateRoom({idUser : idSender, loginReceiver: loginReceiver })
        }
        this.chatService.addMessageToPrivateRoom({idSender: idSender, loginReceiver: loginReceiver, content: content})
        this.server.to(userReceiver.id.toString()).emit('newPrivateMessage', {
            content: content,
            nameSender: user.login,
        })
    }

    @SubscribeMessage("newMessage")
    handleMessage(@MessageBody() body: any) {
        if (body.type == "room")
        {
            body = body as RoomMessageDto;
            this.sendMessageToRoom(body.roomName, body.content, body.idSender)
        }
        else
        {
            body = body as PrivateMessageDto;
            this.sendPrivateMessage(body.idSender, body.loginReceiver, body.content)
        }
    }
    @SubscribeMessage("joinRoom")
    handleJoinRoom(@MessageBody() body: {roomName: string})
    {
        this.server.socketsJoin(body.roomName);
    }
    @SubscribeMessage("leaveRoom")
    handleLeaveRoom(@MessageBody() body: {roomName: string})
    {
        this.server.socketsLeave(body.roomName);
    }
}