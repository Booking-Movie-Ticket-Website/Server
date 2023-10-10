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
import { Rooms } from './Rooms';
import { Movies } from './Movies';
import { Theaters } from './Theaters';
import { Showings } from './Showings';
import { Seats } from './Seats';

@Index('showing_seats_pkey', ['id'], { unique: true })
@Entity('showing_seats', { schema: 'public' })
export class ShowingSeats {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

  @Column('boolean', { name: 'is_booked', nullable: true, default: false })
  isBooked: boolean | null;

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

  @ManyToOne(() => Seats, (seats) => seats.showingSeats)
  @JoinColumn([{ name: 'seat_id', referencedColumnName: 'id' }])
  seat: Seats;
}
