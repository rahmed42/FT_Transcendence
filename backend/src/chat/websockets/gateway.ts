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
			return ;
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
						},
						timestampMuted: null,
					}
				});
			}
			else
				return ;
		}
		this.chatService.addMessageToRoom({idSender: idSender, roomName: roomName, content: content})
		this.server.to(roomName).emit('newRoomMessage', {
            content: content,
            nameSender: user.login,
            roomName: roomName,
        })
    }
    async sendPrivateMessage(roomName : string, idSender: number, loginReceiver: string, content: string) {
        if (!roomName || !idSender || !loginReceiver || !content)
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
		const isBlocked = await this.prisma.user.findFirst({
			where : {
				id: idSender,
				blockedUsers: {
					some: {
						login: loginReceiver,
					}
				}
			},
		})
		const hasBlocked = await this.prisma.user.findFirst({
			where : {
				id: userReceiver.id,
				blockedUsers: {
					some: {
						login: user.login,
					}
				}
			},
		})
		if (hasBlocked || isBlocked)
			return ;
        this.chatService.addMessageToPrivateRoom({idSender: idSender, loginReceiver: loginReceiver, content: content})
        this.server.to(roomName).emit('newPrivateMessage', {
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
            this.sendPrivateMessage(body.roomName, body.idSender, body.loginReceiver, body.content)
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
