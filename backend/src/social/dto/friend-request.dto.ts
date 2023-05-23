import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class FriendRequestDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  requesterId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  requesteeId: number;
}
