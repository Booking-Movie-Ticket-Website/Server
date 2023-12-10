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
import { ShowingSeats } from './ShowingSeats';

@Index('showings_pkey', ['id'], { unique: true })
@Entity('showings', { schema: 'public' })
export class Showings {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('timestamp without time zone', { name: 'start_time', nullable: true })
  startTime: Date | null;

  @Column('timestamp without time zone', { name: 'end_time', nullable: true })
  endTime: Date | null;

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

  @ManyToOne(() => Movies, (movies) => movies.showings)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movie: Movies;

  @Column('bigint', { name: 'movie_id', nullable: true })
  movieId: string | null;

  @ManyToOne(() => Rooms, (rooms) => rooms.showings)
  @JoinColumn([{ name: 'room_id', referencedColumnName: 'id' }])
  room: Rooms;

  @Column('bigint', { name: 'room_id', nullable: true })
  roomId: string | null;

  @OneToMany(() => ShowingSeats, (showingSeats) => showingSeats.showing)
  showingSeats: ShowingSeats[];
}
