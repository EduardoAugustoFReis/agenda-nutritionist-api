import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {PrismaModule} from "../prisma/prisma.module";
import { HashingService } from 'src/common/hash/hash.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, HashingService],
  imports: [PrismaModule],
})
export class UsersModule {}
