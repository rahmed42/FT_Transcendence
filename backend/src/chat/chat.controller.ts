import {Body, Controller, Post} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDtoCreateRoom, ChatDtoJoinRoom } from './dto';

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
    
}
