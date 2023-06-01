import { Global, Module } from "@nestjs/common";
import { Gateway } from "./gateway";
import { ChatModule } from "../chat.module";

@Global()
@Module({
    imports: [ChatModule],
    providers: [Gateway],
})
export class GatewayModule {}