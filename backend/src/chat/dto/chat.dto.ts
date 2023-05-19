import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ChatDtoCreateRoom 
{
    @IsNotEmpty()
    @IsNumber()
    idUser : number;
    
    @IsNotEmpty()
    roomName: string;

    @IsNotEmpty()
    @IsOptional()
    password: string;
    
    @IsNotEmpty()
    type: string;

}

export class ChatDtoJoinRoom
{
    @IsNotEmpty()
    @IsNumber()
    idUser : number;

    @IsNotEmpty()
    roomName : string;

    @IsNotEmpty()
    @IsOptional()
    password: string;
}