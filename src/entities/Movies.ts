import { AutoMap } from '@automapper/classes';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MoviePosters } from './MoviePosters';
import { MovieCategories } from './MovieCategories';
import { MovieParticipants } from './MovieParticipants';
import { Reviews } from './Reviews';
import { Showings } from './Showings';

@Index('movies_pkey', ['id'], { unique: true })
@Entity('movies', { schema: 'public' })
export class Movies {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', {
    name: 'name',
    nullable: true,
    length: 255,
  })
  name: string | null;

  @Column('integer', { name: 'duration', nullable: true, default: 0 })
  duration: number | null;

  @AutoMap()
  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @AutoMap()
  @Column('text', { name: 'trailer_link', nullable: true })
  trailerLink: string | null;

  @AutoMap()
  @Column('date', { name: 'release_date', nullable: true })
  releaseDate: string | null;

  @Column('character varying', {
    name: 'nation',
    nullable: true,
    length: 255,
  })
  nation: string | null;

  @Column('integer', { name: 'total_reviews', nullable: true, default: 0 })
  totalReviews: number | null;

  @Column('double precision', {
    name: 'avg_stars',
    nullable: true,
    default: 0,
    precision: 53,
  })
  avgStars: number | null;

  @Column('boolean', { name: 'is_active', nullable: true })
  isActive: boolean | null;

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

  @OneToMany(() => MoviePosters, (moviePosters) => moviePosters.movie)
  moviePosters: MoviePosters[];

  @OneToMany(() => MovieCategories, (movieCategories) => movieCategories.movie)
  movieCategories: MovieCategories[];

  @OneToMany(
    () => MovieParticipants,
    (movieParticipants) => movieParticipants.movie,
  )
  movieParticipants: MovieParticipants[];

  @OneToMany(() => Reviews, (reviews) => reviews.movie)
  reviews: Reviews[];

  @OneToMany(() => Showings, (showings) => showings.movie)
  showings: Showings[];
}
