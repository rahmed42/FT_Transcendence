import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDtoAdminOperation, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom } from './dto';


@UseGuards()
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
    @Post('kickUser')
    async kickUser(@Body() body: ChatDtoAdminOperation) {
        return await this.ChatService.kickUser(body);
    }
    @Get('rooms/:name')
    async getRoom(@Param('name') roomName: string, @Body() body: ChatDtoGetRoom) {
        body.roomName = roomName;
        return await this.ChatService.getRoomInfo(body);
    }
    /* TODO KICK, BAN, MUTE, LEAVE, GIVE ADMIN, GIVE OWNER, BLOQUER (don't show other messages)    */
}
