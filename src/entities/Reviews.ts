import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Movies } from './Movies';
import { Users } from './Users';

@Index('reviews_pkey', ['id'], { unique: true })
@Entity('reviews', { schema: 'public' })
export class Reviews {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @AutoMap()
  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('integer', { name: 'star', nullable: true, default: 0 })
  star: number | null;

  @Column('timestamp without time zone', { name: 'created_at', nullable: true })
  createdAt: Date | null;

  @Column('bigint', { name: 'created_by', nullable: true })
  createdBy: string | null;

  @AutoMap()
  @OneToOne(() => Users)
  @JoinColumn({ name: 'created_by' })
  createdUser: Users | null;

  @Column('timestamp without time zone', { name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @Column('bigint', { name: 'updated_by', nullable: true })
  updatedBy: string | null;

  @Column('timestamp without time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column('bigint', { name: 'deleted_by', nullable: true })
  deletedBy: string | null;

  @ManyToOne(() => Movies, (movies) => movies.reviews)
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movie: Movies;

  @Column('bigint', { name: 'movie_id', nullable: true })
  movieId: string | null;
}
