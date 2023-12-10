import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowingsController } from './showings.controller';
import { ShowingsService } from 'src/services/showings.service';
import { Showings } from 'src/entities/Showings';
import { Movies } from 'src/entities/Movies';
import { Theaters } from 'src/entities/Theaters';
import { Rooms } from 'src/entities/Rooms';
import { ShowingSeats } from 'src/entities/ShowingSeats';
import { Seats } from 'src/entities/Seats';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showings,
      ShowingSeats,
      Seats,
      Movies,
      Theaters,
      Rooms,
    ]),
  ],
  controllers: [ShowingsController],
  providers: [ShowingsService],
})
export class ShowingsModule {}
