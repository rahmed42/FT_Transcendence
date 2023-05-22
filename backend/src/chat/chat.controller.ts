import {BadRequestException, Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDtoAdminOperation, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom } from './dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly ChatService : ChatService) {}

    @Post('createRoom')
    async createRoom(@Body() body: ChatDtoCreateRoom) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        return await this.ChatService.createRoom(body);
    }

    @Post('joinRoom')
    async joinRoom(@Body() body: ChatDtoJoinRoom) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        return await this.ChatService.joinRoom(body);
    }
    @Post('inviteUser')
    async inviteUser(@Body() body: ChatDtoAdminOperation) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        return await this.ChatService.inviteUser(body);
    }
    @Post('kickUser')
    async kickUser(@Body() body: ChatDtoAdminOperation) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        return await this.ChatService.kickUser(body);
    }
    @Get('rooms')
    async getRooms(body : ChatDtoGetRoom) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        return await this.ChatService.getRooms(body);
    }
    @Get('rooms/:name')
    async getRoom(@Param('name') roomName: string, @Body() body: ChatDtoGetRoom) {
        if (!body)
        {
            throw new BadRequestException("Body is empty");
        }
        body.roomName = roomName;
        return await this.ChatService.getRoomInfo(body);
    }
    /* TODO KICK, BAN, MUTE, LEAVE, GIVE ADMIN, GIVE OWNER, BLOQUER (don't show other messages)    */
}
