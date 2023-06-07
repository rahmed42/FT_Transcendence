import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { GatewayModule } from './chat/websockets/gateway.module';
import { SocialModule } from './social/social.module';
import { SocialController } from './social/social.controller';
import { SocialService } from './social/social.service';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule, UserModule, ChatModule, GatewayModule, SocialModule],
  controllers: [AuthController, UserController, ChatController, SocialController],
  providers: [AuthService, UserService, ChatService, SocialService],
})
export class AppModule {}
