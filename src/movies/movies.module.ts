import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleService } from 'src/services/people.service';
import { Movies } from 'src/entities/Movies';
import { MoviesController } from './movies.controller';
import { MoviesService } from 'src/services/movies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movies])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
