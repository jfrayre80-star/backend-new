import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users } from './Users';
import { Teachers } from './Teachers';
import { Admins } from './Admins';
import { Parents } from './Parents';
import { Students } from './Students';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Teachers, Admins, Parents, Students])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
