import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categories } from './Categories';
import { Bookings } from './Bookings';
import { ShowingSeats } from './ShowingSeats';

@Index('booking_seats_pkey', ['id'], { unique: true })
@Entity('booking_seats', { schema: 'public' })
export class BookingSeats {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @ManyToOne(() => Bookings, (bookings) => bookings.bookingSeats)
  @JoinColumn([{ name: 'booking_id', referencedColumnName: 'id' }])
  booking: Bookings;

  @OneToOne(() => ShowingSeats)
  @JoinColumn({ name: 'showing_seat_id' })
  showingSeat: ShowingSeats | null;
}
