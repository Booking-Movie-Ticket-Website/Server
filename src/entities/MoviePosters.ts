import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movies } from './Movies';

@Index('movie_posters_pkey', ['id'], { unique: true })
@Entity('movie_posters', { schema: 'public' })
export class MoviePosters {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('text', { name: 'link', nullable: true })
  link: string | null;

  @ManyToOne(() => Movies, (movies) => movies.moviePosters)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movie: Movies;

  @Column('bigint', { name: 'movie_id', nullable: true })
  movieId: string | null;

  @Column('boolean', { name: 'is_thumb', nullable: true, default: false })
  isThumb: boolean | null;
}
