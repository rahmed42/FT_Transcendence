import { IsNotEmpty } from 'class-validator';

export class FriendRequestDto {
  @IsNotEmpty()
  requesterLogin: string;

  @IsNotEmpty()
  requesteeLogin: string;
}
