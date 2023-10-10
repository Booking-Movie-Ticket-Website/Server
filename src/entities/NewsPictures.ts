import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { News } from './News';

@Index('News_pictures_pkey', ['id'], { unique: true })
@Entity('News_pictures', { schema: 'public' })
export class NewsPictures {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('text', { name: 'link', nullable: true })
  link: string | null;

  @ManyToOne(() => News, (news) => news.newsPictures)
  @JoinColumn([{ name: 'news_id', referencedColumnName: 'id' }])
  news: News;
}
