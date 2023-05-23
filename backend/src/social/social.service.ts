import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}
  async sendFriendRequest(requesterId: number, requesteeId: number): Promise<any> {
    // Throw an error if the requester and requestee are the same
    if(requesterId === requesteeId){
      throw new Error('Cannot send friend request to yourself');
    }
  
    // Check if a friend request already exists between the users
    const existingRequest = await this.prisma.friend.findFirst({
      where: {
        OR: [
          // Look for requests in both directions between users
          { requesterId: requesterId, requesteeId: requesteeId },
          { requesterId: requesteeId, requesteeId: requesterId },
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
        requesterId: requesterId,
        requesteeId: requesteeId,
        status: 'pending',
      },
    });
  
    return friendRequest;
  }

  async acceptFriendRequest(friendRequestId: number): Promise<any> {
    // Throw an error if friendRequestId is not an integer
    if (!Number.isInteger(friendRequestId)) {
      throw new Error('Invalid friend request ID');
    }
    // Find the friend request by its unique ID
    const friendRequest = await this.prisma.friend.findUnique({
      where: { id: friendRequestId },
    });

    // Throw an error if the friend request does not exist
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    // Throw an error if the friend request is not in 'pending' status
    if (friendRequest.status !== 'pending') {
      throw new Error('Friend request is not in a "pending" state');
    }

    // Update the status of the friend request to 'accepted'
    const updatedFriendRequest = await this.prisma.friend.update({
      where: { id: friendRequestId },
      data: { status: 'accepted' },
    });

    return updatedFriendRequest;
  }

  async rejectFriendRequest(friendRequestId: number): Promise<any> {
    if (!Number.isInteger(friendRequestId)) {
      throw new Error('Invalid friend request ID');
    }
    // Find the friend request by its unique ID
    const friendRequest = await this.prisma.friend.findUnique({
      where: { id: friendRequestId },
    });

    // Throw an error if the friend request does not exist
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    // Throw an error if the friend request is not in 'pending' status
    if (friendRequest.status !== 'pending') {
      throw new Error('Friend request is not in a "pending" state');
    }

    // Update the status of the friend request to 'rejected'
    const updatedFriendRequest = await this.prisma.friend.update({
      where: { id: friendRequestId },
      data: { status: 'rejected' },
    });

    return updatedFriendRequest;
  }

  async getFriendList(userId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Include the users who the current user has sent friend requests to
        friendRequestSent: { include: { requesteeUser: true } },
        // Include the users who have sent friend requests to the current user
        friendRequestReceived: { include: { requesterUser: true } },
      },
    });

    // Throw an error if the user does not exist
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter the sent friend requests to only those that were accepted
    // and map the list to only include the requested users
    const sentFriendList = user.friendRequestSent
      .filter((friend) => friend.status === 'accepted')
      .map((friend) => friend.requesteeUser);

    // Filter the received friend requests to only those that were accepted
    // and map the list to only include the requesting users
    const receivedFriendList = user.friendRequestReceived
      .filter((friend) => friend.status === 'accepted')
      .map((friend) => friend.requesterUser);

    // Combine both lists to get the complete friend list
    const friendList = [...sentFriendList, ...receivedFriendList];

    return friendList;
  }
}