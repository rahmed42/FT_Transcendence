import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    imports: [JwtModule.register({})],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule {}