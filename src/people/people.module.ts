import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from 'src/entities/People';
import { PeopleController } from './people.controller';
import { PeopleService } from 'src/services/people.service';

@Module({
  imports: [TypeOrmModule.forFeature([People])],
  controllers: [PeopleController],
  providers: [PeopleService],
})
export class PeopleModule {}
