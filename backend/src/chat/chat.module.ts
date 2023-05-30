import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
@Module({})
export class ChatModule {
    controllers: [ChatController];
    providers: [ChatService];
}