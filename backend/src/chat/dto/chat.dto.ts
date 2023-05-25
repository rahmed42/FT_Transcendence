import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class ChatDtoCreateRoom 
{
    @IsNotEmpty()
    @IsNumber()
    idUser : number;
    
    @IsNotEmpty()
    roomName: string;

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

    @IsOptional()
    password: string;
}

export class ChatDtoAdminOperation
{
    @IsNotEmpty()
    @IsNumber()
    idAdmin : number;

    @IsNotEmpty()
    roomName : string;

    @IsNotEmpty()
    idUserToExecute : number;
}

export class ChatDtoGetRoom 
{
    @IsNotEmpty()
    @IsNumber()
    idUser : number;

    @IsOptional()
    roomName : string;
}

export class PrivateChatDtoCreateRoom
{
    @IsNotEmpty()
    @IsNumber()
    idUser : number;

    @IsNotEmpty()
    loginReceiver : string;
}

export class PrivateChatDtoCreateMessage
{
    @IsNotEmpty()
    @IsNumber()
    idSender : number;

    @IsNotEmpty()
    loginReceiver : string;

    @IsNotEmpty()
    content : string;
}