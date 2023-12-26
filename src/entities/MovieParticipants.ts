import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movies } from './Movies';
import { Categories } from './Categories';
import { People } from './People';

@Index('movie_participants_pkey', ['id'], { unique: true })
@Entity('movie_participants', { schema: 'public' })
export class MovieParticipants {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @ManyToOne(() => Movies, (movies) => movies.movieParticipants)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movie: Movies;

  @Column('bigint', { name: 'movie_id', nullable: true })
  movieId: string | null;

  @ManyToOne(() => People, (people) => people.movieParticipants)
  @JoinColumn([{ name: 'people_id', referencedColumnName: 'id' }])
  people: People;

  @Column('bigint', { name: 'people_id', nullable: true })
  peopleId: string | null;
}
