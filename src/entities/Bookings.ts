import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rooms } from './Rooms';
import { Movies } from './Movies';
import { Theaters } from './Theaters';
import { ShowingSeats } from './ShowingSeats';
import { Users } from './Users';
import { BookingSeats } from './BookingSeats';

@Index('bookings_pkey', ['id'], { unique: true })
@Entity('bookings', { schema: 'public' })
export class Bookings {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('double precision', {
    name: 'total_price',
    nullable: true,
    default: 0,
    precision: 53,
  })
  totalPrice: number | null;

  @Column('character varying', { name: 'status', nullable: true, length: 255 })
  status: string | null;

  @Column('timestamp without time zone', { name: 'created_at', nullable: true })
  createdAt: Date | null;

  @Column('bigint', { name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column('timestamp without time zone', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('bigint', { name: 'updated_by', nullable: true })
  updatedBy: string | null;

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('bigint', { name: 'deleted_by', nullable: true })
  deletedBy: string | null;

  @ManyToOne(() => Users, (users) => users.bookings)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;

  @OneToMany(() => BookingSeats, (bookingSeats) => bookingSeats.booking)
  bookingSeats: BookingSeats[];
}
