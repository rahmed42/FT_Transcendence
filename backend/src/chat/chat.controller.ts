import {BadRequestException, Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDtoAdminOperation, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom } from './dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly ChatService : ChatService) {}

    @Post('createRoom')
    async createRoom(@Body() body: ChatDtoCreateRoom) {
        return await this.ChatService.createRoom(body);
    }

    @Post('joinRoom')
    async joinRoom(@Body() body: ChatDtoJoinRoom) {
        return await this.ChatService.joinRoom(body);
    }
    @Post('inviteUser')
    async inviteUser(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.inviteUser(body);
    }
    @Post ('removeInvite')
    async removeInvite(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.removeInvite(body);
    }
    @Post('kickUser')
    async kickUser(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.kickUser(body);
    }
    @Post('banUser')
    async banUser(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.banUser(body);
    }
    @Post('unbanUser')
    async unbanUser(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.unbanUser(body);
    }
    @Get('rooms')
    async getRooms(@Body() body : ChatDtoGetRoom) {
        return await this.ChatService.getRooms(body);
    }
    @Get('rooms/:name')
    async getRoom(@Param('name') roomName: string, @Body() body: ChatDtoGetRoom) {
        body.roomName = roomName;
        return await this.ChatService.getRoomInfo(body);
    }
    @Post('leaveRoom')
    async leaveRoom(@Body() body: ChatDtoJoinRoom)
    {
        return await this.ChatService.leaveRoom(body);
    }

    @Post('giveAdmin')
    async giveAdmin(@Body() body: ChatDtoAdminOperation)
    {
        return await this.ChatService.giveAdmin(body);
    }
    @Post('removeAdmin')
    async removeAdmin(@Body() body: ChatDtoAdminOperation)
    {
        return await this.ChatService.removeAdmin(body);
    }
    @Post('giveOwner')
    async giveOwner(@Body() body: ChatDtoAdminOperation)
    {
        return await this.ChatService.giveOwner(body);
    }
    /* TODO MUTE, BLOQUER (don't show other messages) */
}
