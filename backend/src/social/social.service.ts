import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}
    async sendFriendRequest(requesterLogin: string, requesteeLogin: string): Promise<any> {

      if(requesterLogin === requesteeLogin){
        return { status: 'error', message: 'Error: Cannot send friend request to yourself' };
      }

      if(!requesterLogin || !requesteeLogin){
        return { status: 'error', message: 'Error: Invalid user login' };
      }

      const requester = await this.prisma.user.findUnique({ where: { login: requesterLogin }});
      const requestee = await this.prisma.user.findUnique({ where: { login: requesteeLogin }});
      if(!requester || !requestee){
        return { status: 'error', message: 'Error: User not found' };
      }

      const existingRequest = await this.prisma.friend.findFirst({
        where: {
          OR: [
            { requesterId: requester.id, requesteeId: requestee.id },
            { requesterId: requestee.id, requesteeId: requester.id },
          ],
        },
      });

      if (existingRequest) {
        return { status: 'error', message: 'Error: Friend request already exists' };
      }

      const friendRequest = await this.prisma.friend.create({
        data: {
          requesterId: requester.id,
          requesteeId: requestee.id,
          status: 'pending',
        },
      });
      const friendData = await this.prisma.friend.findFirst({
        where: {
            requesteeId : requestee.id,
            requesterId : requester.id,
        },
        select : {
          requesterId: true,
          requesteeId: true,
          id: true,
          status: true,
        }
    })
      return { status: 'success', data: friendRequest };
    }

    async getFriendRequests(userLogin: string): Promise<any> {
      if (userLogin == undefined)
        return
      const user = await this.prisma.user.findUnique({ where: { login: userLogin } });
      if(!user){
        return { status: 'error', message: '' };
      }
      const friendRequests = await this.prisma.friend.findMany({
        where: {
          requesteeId: user.id,
          status: 'pending',
        },
        include: {
          requester: true,  // include the requester object
          requestee: true,  // include the requestee object
        },
      });

      return friendRequests;
    }

    async acceptFriendRequest(id: number): Promise<any> {

      const friendRequest = await this.prisma.friend.findUnique({ where: { id } });
      if(!friendRequest){
        return { status: 'error', message: 'Error: Friend request not found' };
      }

      const updatedFriendRequest = await this.prisma.friend.update({
        where: { id },
        data: { status: 'accepted' },
      });

      return updatedFriendRequest;
    }

    async rejectFriendRequest(id: number): Promise<any> {

      const friendRequest = await this.prisma.friend.findUnique({ where: { id } });
      if(!friendRequest){
        return { status: 'error', message: 'Error: Friend request not found' };
      }

      const updatedFriendRequest = await this.prisma.friend.update({
        where: { id },
        data: { status: 'rejected' },
      });

      return updatedFriendRequest;
    }

    async getFriendList(userLogin: string): Promise<any> {

      if (userLogin == undefined)
        return ;
      const user = await this.prisma.user.findUnique({ where: { login: userLogin }});
      if(!user){
        return { status: 'error', message: '' };
      }

      const friendList = await this.prisma.friend.findMany({
        where: {
          OR: [
            { requesterId: user.id, status: 'accepted' },
            { requesteeId: user.id, status: 'accepted' },
          ],
        },
        include: {
          requester: {
            select: { login: true, small_pic: true, status: true, avatar: true }
          },
          requestee: {
            select: { login: true, small_pic: true, status: true, avatar: true }
          },
        },
      });

      return friendList.map((friend) => ({
        id: friend.id,
        friend: friend.requesterId === user.id ? friend.requestee : friend.requester,
      }));
    }

    async deleteFriend(id: number): Promise<any> {

      const friend = await this.prisma.friend.findUnique({ where: { id } });
      if(!friend){
        return { status: 'error', message: 'Error: Friend not found' };
      }

      const deletedFriend = await this.prisma.friend.delete({
        where: { id },
      });

      return deletedFriend;
    }

    async getUserStats(userLogin: string): Promise<any> {

      const user = await this.prisma.user.findUnique({ where: { login: userLogin } });
      // if(!user){
      //   return { status: 'error', message: 'Error: User not found' };
      // }

      const userStats = await this.prisma.stats.findUnique({ where: { userId: user.id } });
      if (!userStats) {
        return { status: 'error', message: 'Error: No stats available for this user' };
      }

      return userStats;
    }

    async getUserMatchHistory(userLogin: string): Promise<any> {

      const user = await this.prisma.user.findUnique({ where: { login: userLogin } });
      // if(!user){
      //   return { status: 'error', message: 'Error: User not found' };
      // }

      const matchHistory = await this.prisma.matchHistory.findMany({ where: { userId: user.id } });

      return matchHistory || [];
    }
    async getFriend(id_d : number)
    {
      const friend = await this.prisma.friend.findUnique({ where: { id: id_d }, select : {requesterId : true, requesteeId: true}});
      if (!id_d)
        return { status: 'error', message: 'Error: Id not found' };
      if (!friend)
        return { status: 'error', message: 'Error: Friend not found' };
      return friend;
    }
  }