import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatsController } from './seats.controller';
import { Seats } from 'src/entities/Seats';
import { SeatsService } from 'src/services/seats.service';
import { Rooms } from 'src/entities/Rooms';

@Module({
  imports: [TypeOrmModule.forFeature([Seats, Rooms])],
  controllers: [SeatsController],
  providers: [SeatsService],
})
export class SeatsModule {}
