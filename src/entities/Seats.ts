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
import { ShowingSeats } from './ShowingSeats';

@Index('seats_pkey', ['id'], { unique: true })
@Entity('seats', { schema: 'public' })
export class Seats {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', {
    name: 'seat_row',
    nullable: true,
    length: 255,
  })
  seatRow: string | null;

  @Column('character varying', {
    name: 'seat_column',
    nullable: true,
    length: 255,
  })
  seatColumn: string | null;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

  @Column('integer', { name: 'pair_with', nullable: true, default: 0 })
  pairWith: number | null;

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

  @ManyToOne(() => Rooms, (rooms) => rooms.seats)
  @JoinColumn([{ name: 'room_id', referencedColumnName: 'id' }])
  room: Rooms;

  @OneToMany(() => ShowingSeats, (showingSeats) => showingSeats.seat)
  showingSeats: ShowingSeats[];
}
