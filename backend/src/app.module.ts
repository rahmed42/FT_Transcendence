import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, PrismaModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
