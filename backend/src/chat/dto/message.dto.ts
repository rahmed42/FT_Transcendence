export class PrivateMessageDto
{
    idSender : number;
    loginReceiver : string;
	roomName : string;
    content: string;
    type: string;
}

export class RoomMessageDto
{
    idSender : number;
    roomName : string;
    content: string;
    type: string;
}
