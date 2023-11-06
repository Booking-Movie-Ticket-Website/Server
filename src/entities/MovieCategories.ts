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

@Index('movie_categories_pkey', ['id'], { unique: true })
@Entity('movie_categories', { schema: 'public' })
export class MovieCategories {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @ManyToOne(() => Movies, (movies) => movies.movieCategories)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movie: Movies;

  @Column('bigint', { name: 'movie_id', nullable: true })
  movieId: string | null;

  @ManyToOne(() => Categories, (categories) => categories.movieCategories)
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
  category: Categories;

  @Column('bigint', { name: 'category_id', nullable: true })
  categoryId: string | null;
}
