import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';


@Module({
    imports: [JwtModule.register({})],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule {}