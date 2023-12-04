import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { NewsPictures } from './NewsPictures';

@Index('news_pkey', ['id'], { unique: true })
@Entity('news', { schema: 'public' })
export class News {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @AutoMap()
  @Column('text', { name: 'title', nullable: true })
  title: string | null;

  @AutoMap()
  @Column('text', { name: 'short_desc', nullable: true })
  shortDesc: string | null;

  @AutoMap()
  @Column('text', { name: 'full_desc', nullable: true, select: false })
  fullDesc: string | null;

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

  @OneToMany(() => NewsPictures, (newsPictures) => newsPictures.news)
  newsPictures: NewsPictures[];
}
