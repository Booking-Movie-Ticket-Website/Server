import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleService } from 'src/services/people.service';
import { Movies } from 'src/entities/Movies';
import { MoviesController } from './movies.controller';
import { MoviesService } from 'src/services/movies.service';
import { MovieCategories } from 'src/entities/MovieCategories';
import { MovieParticipants } from 'src/entities/MovieParticipants';
import { People } from 'src/entities/People';
import { MoviePosters } from 'src/entities/MoviePosters';
import { CloudinaryService } from 'src/utils/cloudinary';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movies,
      MovieCategories,
      MovieParticipants,
      People,
      MoviePosters,
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService, CloudinaryService],
})
export class MoviesModule {}
