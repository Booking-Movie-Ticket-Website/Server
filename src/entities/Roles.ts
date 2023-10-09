import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';
import { AutoMap } from '@automapper/classes';

@Index('roles_pkey', ['id'], { unique: true })
@Entity('roles', { schema: 'public' })
export class Roles {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('boolean', { name: 'is_active', nullable: true })
  isActive: boolean | null;

  @Column('boolean', { name: 'is_access_cms', nullable: true })
  isAccessCms: boolean | null;

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

  @OneToMany(() => Users, (users) => users.role)
  users: Users[];
}
