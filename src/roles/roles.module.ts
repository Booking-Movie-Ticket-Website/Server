import { Module } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/entities/Roles';

@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
