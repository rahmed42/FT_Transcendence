import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const dotenv = require('dotenv');
dotenv.config();


@Global() // exports PrismaService in all the application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
