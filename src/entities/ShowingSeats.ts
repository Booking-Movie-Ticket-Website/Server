import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Showings } from './Showings';
import { Seats } from './Seats';
import { Bookings } from './Bookings';

@Index('showing_seats_pkey', ['id'], { unique: true })
@Entity('showing_seats', { schema: 'public' })
export class ShowingSeats {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

  @Column('double precision', {
    name: 'price',
    nullable: true,
    default: 0,
    precision: 53,
  })
  price: number | null;

  @ManyToOne(() => Showings, (showings) => showings.showingSeats)
  @JoinColumn([{ name: 'showing_id', referencedColumnName: 'id' }])
  showing: Showings;

  @Column('bigint', { name: 'showing_id', nullable: true })
  showingId: string | null;

  @ManyToOne(() => Seats, (seats) => seats.showingSeats)
  @JoinColumn([{ name: 'seat_id', referencedColumnName: 'id' }])
  seat: Seats;

  @Column('bigint', { name: 'seat_id', nullable: true })
  seatId: string | null;

  @ManyToOne(() => Bookings, (bookings) => bookings.showingSeats)
  @JoinColumn([{ name: 'booking_id', referencedColumnName: 'id' }])
  booking: Bookings;

  @Column('bigint', { name: 'booking_id', nullable: true })
  bookingId: string | null;
}
