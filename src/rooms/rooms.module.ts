import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theaters } from 'src/entities/Theaters';
import { Rooms } from 'src/entities/Rooms';
import { RoomsController } from './rooms.controller';
import { RoomsService } from 'src/services/rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rooms, Theaters])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
