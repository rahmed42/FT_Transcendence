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
			console.log("New connection from socket io ", socket.id)
		});
    }

    async sendMessageToRoom(roomName: string, content: string, idSender: number) {
        if (!idSender || !roomName || !content)
			return ;
		const room = await this.prisma.room.findFirst({
            where : {
                name: roomName,
            }
        })
        if (!room)
            return;
        const user = await this.prisma.user.findFirst({
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
		{
			//  if date is passed, remove from mutedRooms
			if (isUserMuted.timestampMuted.getDate() <= Date.now())
			{
				await this.prisma.user.update({
					where : {
						id: idSender,
					},
					data : {
						mutedRooms : {
							delete: {
								name: roomName,
							}
						}
					}
				});
			}
			else
				return ;
		}
		this.server.to(roomName).emit('newRoomMessage', {
            content: content,
            nameSender: user.login,
            roomName: roomName,
        })
    }
    async sendPrivateMessage(idSender: number, loginReceiver: string, content: string) {
        if (!idSender || !loginReceiver || !content)
			return ;
		const user = await this.prisma.user.findFirst({
            where : {
                id: idSender,
            }
        })
        if (!user)
            return ;
        const userReceiver = await this.prisma.user.findFirst({
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
        else if (body.type == "private")
        {
            body = body as PrivateMessageDto;
            this.sendPrivateMessage(body.idSender, body.loginReceiver, body.content)
        }
		else
			return ;
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
