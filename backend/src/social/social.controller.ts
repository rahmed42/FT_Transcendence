import { Controller, Post, Body, Param, Patch, Get, Delete } from '@nestjs/common';
import { SocialService } from './social.service';
import { FriendRequestDto } from './dto/friend-request.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('friend-request')
  async sendFriendRequest(@Body() body: FriendRequestDto): Promise<any> {
    return this.socialService.sendFriendRequest(body.requesterLogin, body.requesteeLogin);
  }

  @Get('friend-requests/:userLogin')
  async getFriendRequests(@Param('userLogin') userLogin: string): Promise<any> {
    return this.socialService.getFriendRequests(userLogin);
  }

  @Patch('friend-request/:id/accept')
  async acceptFriendRequest(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.socialService.acceptFriendRequest(id);
  }

  @Patch('friend-request/:id/reject')
  async rejectFriendRequest(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.socialService.rejectFriendRequest(id);
  }

  @Get('friend-list/:userLogin')
  async getFriendList(@Param('userLogin') userLogin: string): Promise<any> {
    return this.socialService.getFriendList(userLogin);
  }

  @Delete('friend/:id')
  async deleteFriend(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.socialService.deleteFriend(id);
  }
}