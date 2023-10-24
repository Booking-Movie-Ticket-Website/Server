import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from 'src/entities/Categories';
import { CategoryPictures } from 'src/entities/CategoryPictures';
import { MovieCategories } from 'src/entities/MovieCategories';
import { CategoriesService } from 'src/services/categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categories, CategoryPictures, MovieCategories]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
