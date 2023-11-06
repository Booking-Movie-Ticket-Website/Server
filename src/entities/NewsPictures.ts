import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { News } from './News';

@Index('news_pictures_pkey', ['id'], { unique: true })
@Entity('news_pictures', { schema: 'public' })
export class NewsPictures {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('text', { name: 'link', nullable: true })
  link: string | null;

  @ManyToOne(() => News, (news) => news.newsPictures)
  @JoinColumn([{ name: 'news_id', referencedColumnName: 'id' }])
  news: News;

  @Column('bigint', { name: 'news_id', nullable: true })
  newsId: string | null;
}
