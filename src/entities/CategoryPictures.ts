import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categories } from './Categories';

@Index('category_pictures_pkey', ['id'], { unique: true })
@Entity('category_pictures', { schema: 'public' })
export class CategoryPictures {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('text', { name: 'link', nullable: true })
  link: string | null;

  @ManyToOne(() => Categories, (categories) => categories.categoryPictures)
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
  category: Categories;
}
