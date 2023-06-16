import { Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDtoAdminOperation, ChatDtoBlockUser, ChatDtoCreateRoom, ChatDtoGetRoom, ChatDtoJoinRoom } from './dto';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
    constructor(private readonly ChatService : ChatService, private userService : UserService) {}

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
    async getRooms(@Req() req: Request) {
        const userInfo = await this.userService.getInfo({jwt : ExtractJwt.fromAuthHeaderAsBearerToken()(req)});
        const id = (userInfo as { id: number, [key: string]: any }).id;
        const body: ChatDtoGetRoom = {
            idUser: id,
            roomName: ''
          };
        return await this.ChatService.getRooms(body);
    }
    @Get('rooms/:name')
    async getRoom(@Param('name') roomName: string, @Req() req: Request) {
        const userInfo = await this.userService.getInfo({jwt : ExtractJwt.fromAuthHeaderAsBearerToken()(req)});
        const id = (userInfo as { id: number, [key: string]: any }).id;
        const body: ChatDtoGetRoom = {
            idUser: id,
            roomName,
          };
        return await this.ChatService.getRoomInfo(body);
    }
    @Get('privateRooms')
    async getPrivateRooms(@Req() req: Request) {
        const userInfo = await this.userService.getInfo({jwt : ExtractJwt.fromAuthHeaderAsBearerToken()(req)});
		const id = (userInfo as { id: number, [key: string]: any }).id;
        const body: ChatDtoGetRoom = {
            idUser: id,
            roomName: ''
          };
        return await this.ChatService.getPrivateRooms(body);
    }
    @Get('privateRooms/:name')
    async getPrivateRoom(@Param('name') roomName: string, @Req() req: Request) {
        const userInfo = await this.userService.getInfo({jwt : ExtractJwt.fromAuthHeaderAsBearerToken()(req)});
        const id = (userInfo as { id: number, [key: string]: any }).id;
        const body : ChatDtoGetRoom = {
            roomName,
            idUser : id,
        }
        return await this.ChatService.getPrivateRoomInfo(body);
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
    @Post('blockUser')
    async blockUser(@Body() body: ChatDtoBlockUser)
    {
		return await this.ChatService.blockUser(body);
    }
	@Post('unblockUser')
	async unblockUser(@Body() body: ChatDtoBlockUser)
	{
		return await this.ChatService.unblockUser(body);
	}
	@Post('muteUser')
	async muteUser(@Body() body: ChatDtoAdminOperation)
	{
		return await this.ChatService.muteUser(body);
	}
	@Post('unmuteUser')
	async unmuteUser(@Body() body: ChatDtoAdminOperation)
	{
		return await this.ChatService.unmuteUser(body);
	}
	@Post('changePassword')
	async changePassword(@Body() body: ChatDtoJoinRoom)
	{
		return await this.ChatService.changePassword(body);
	}
	@Post('changeRoomType')
	async changeRoomType(@Body() body: ChatDtoCreateRoom)
	{
		return await this.ChatService.changeRoomType(body);
	}
}
