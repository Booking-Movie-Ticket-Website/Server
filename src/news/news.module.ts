import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from 'src/entities/News';
import { NewsPictures } from 'src/entities/NewsPictures';
import { NewsService } from 'src/services/news.service';
import { NewsController } from './news.controller';
import { CloudinaryService } from 'src/utils/cloudinary';

@Module({
  imports: [TypeOrmModule.forFeature([News, NewsPictures])],
  controllers: [NewsController],
  providers: [NewsService, CloudinaryService],
})
export class NewsModule {}
