import { Controller, Post, Body, Param, Patch, Get, ParseIntPipe } from '@nestjs/common';
import { SocialService } from './social.service';
import { FriendRequestDto } from './dto/friend-request.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('friend-request')
  async sendFriendRequest(@Body() body: FriendRequestDto): Promise<any> {
    return this.socialService.sendFriendRequest(body.requesterId, body.requesteeId);
  }

  @Get('friend-requests/:userId')
  async getFriendRequests(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
    return this.socialService.getFriendRequests(userId);
  }

  @Patch('friend-request/:id/accept')
  async acceptFriendRequest(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.socialService.acceptFriendRequest(id);
  }

  @Patch('friend-request/:id/reject')
  async rejectFriendRequest(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.socialService.rejectFriendRequest(id);
  }

  @Get('friend-list/:userId')
  async getFriendList(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
    return this.socialService.getFriendList(userId);
  }
}