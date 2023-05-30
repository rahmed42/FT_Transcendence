import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}
  async sendFriendRequest(requesterLogin: string, requesteeLogin: string): Promise<any> {
    // Throw an error if the requester and requestee are the same
    if(requesterLogin === requesteeLogin){
      throw new Error('Cannot send friend request to yourself');
    }

    const requester = await this.prisma.user.findUnique({ where: { login: requesterLogin }});
    const requestee = await this.prisma.user.findUnique({ where: { login: requesteeLogin }});

    if(!requester || !requestee){
      throw new Error('One or more users not found');
    }

    // Check if a friend request already exists between the users
    const existingRequest = await this.prisma.friend.findFirst({
      where: {
        OR: [
          // Look for requests in both directions between users
          { requesterId: requester.id, requesteeId: requestee.id },
          { requesterId: requestee.id, requesteeId: requester.id },
        ],
      },
    });

    // Throw an error if a request already exists
    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    // Create a new friend request with 'pending' status
    const friendRequest = await this.prisma.friend.create({
      data: {
        requesterId: requester.id,
        requesteeId: requestee.id,
        status: 'pending',      },
      });
  
      return friendRequest;
    }
  
    async getFriendRequests(userLogin: string): Promise<any> {
      const user = await this.prisma.user.findUnique({ where: { login: userLogin } });
      if(!user){
        throw new Error('User not found');
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
        throw new NotFoundException('Friend request not found');
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
        throw new NotFoundException('Friend request not found');
      }
      const updatedFriendRequest = await this.prisma.friend.update({
        where: { id },
        data: { status: 'rejected' },
      });
      return updatedFriendRequest;
    }
  
    async getFriendList(userLogin: string): Promise<any> {
      const user = await this.prisma.user.findUnique({ where: { login: userLogin }});
      if(!user){
        throw new Error('User not found');
      }
      const friendList = await this.prisma.friend.findMany({
        where: {
          OR: [
            { requesterId: user.id, status: 'accepted' },
            { requesteeId: user.id, status: 'accepted' },
          ],
        },
        include: {
          requester: true,
          requestee: true,
        },
      });
  
      return friendList.map((friend) => ({
        id: friend.id,
        friend: friend.requesterId === user.id ? friend.requestee : friend.requester,
      }));
    }
  }
  
