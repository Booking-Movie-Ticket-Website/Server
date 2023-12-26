import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovieParticipants } from './MovieParticipants';

@Index('people_pkey', ['id'], { unique: true })
@Entity('people', { schema: 'public' })
export class People {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', {
    name: 'full_name',
    nullable: true,
    length: 255,
  })
  fullName: string | null;

  @Column('character varying', { name: 'gender', nullable: true, length: 255 })
  gender: string | null;

  @Column('text', { name: 'profile_picture', nullable: true })
  profilePicture: string | null;

  @Column('date', { name: 'date_of_birth', nullable: true })
  dateOfBirth: string | null;

  @Column('text', { name: 'biography', nullable: true })
  biography: string | null;

  @Column('character varying', {
    name: 'nationality',
    nullable: true,
    length: 255,
  })
  nationality: string | null;

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

  @OneToMany(
    () => MovieParticipants,
    (movieParticipants) => movieParticipants.people,
  )
  movieParticipants: MovieParticipants[];
}
