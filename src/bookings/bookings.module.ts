import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings } from 'src/entities/Bookings';
import { BookingsController } from './bookings.controller';
import { BookingsService } from 'src/services/bookings.service';
import { Movies } from 'src/entities/Movies';
import { Seats } from 'src/entities/Seats';
import { Rooms } from 'src/entities/Rooms';
import { Showings } from 'src/entities/Showings';
import { ShowingSeats } from 'src/entities/ShowingSeats';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bookings,
      Movies,
      Seats,
      Rooms,
      Showings,
      ShowingSeats,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
