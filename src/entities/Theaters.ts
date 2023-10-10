import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rooms } from './Rooms';
import { Showings } from './Showings';

@Index('theaters_pkey', ['id'], { unique: true })
@Entity('theaters', { schema: 'public' })
export class Theaters {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('character varying', { name: 'city', nullable: true, length: 255 })
  city: string | null;

  @Column('text', { name: 'address', nullable: true })
  address: string | null;

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

  @OneToMany(() => Rooms, (rooms) => rooms.theater)
  rooms: Rooms[];

  @OneToMany(() => Showings, (showings) => showings.theater)
  showings: Showings[];
}
