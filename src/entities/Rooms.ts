import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Theaters } from './Theaters';
import { Seats } from './Seats';
import { Showings } from './Showings';

@Index('rooms_pkey', ['id'], { unique: true })
@Entity('rooms', { schema: 'public' })
export class Rooms {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('integer', { name: 'capacity', nullable: true, default: 0 })
  capacity: number | null;

  @Column('character varying', { name: 'type', nullable: true, length: 255 })
  type: string | null;

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

  @ManyToOne(() => Theaters, (theaters) => theaters.rooms)
  @JoinColumn([{ name: 'theater_id', referencedColumnName: 'id' }])
  theater: Theaters;

  @OneToMany(() => Seats, (seats) => seats.room)
  seats: Seats[];

  @OneToMany(() => Showings, (showings) => showings.room)
  showings: Showings[];
}
