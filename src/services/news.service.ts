import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Reviews } from 'src/entities/Reviews';
import {
  CreateReviewDto,
  ReviewFilter,
  UpdateReviewDto,
} from 'src/reviews/dto/reviews.dto';
import { Movies } from 'src/entities/Movies';
import { News } from 'src/entities/News';
import {
  CreateNewsDto,
  NewsFilter,
  UpdateNewsDto,
} from 'src/news/dto/news.dto';
import { NewsPictures } from 'src/entities/NewsPictures';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(NewsPictures)
    private newsPicturesRepository: Repository<NewsPictures>,
  ) {}
  async create(dto: CreateNewsDto, createdBy: string) {
    const { title, shortDesc, fullDesc, newsPictures } = dto;
    if (!title || !shortDesc || !fullDesc)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    const newNews = await this.newsRepository.save(
      this.newsRepository.create({
        title,
        shortDesc,
        fullDesc,
        createdAt: moment().format(),
        createdBy,
      }),
    );

    const { id: newsId } = newNews;

    if (newsPictures?.length > 0) {
      const preparedNewsPictures = await this.prepareNewsPictures(
        newsPictures,
        newsId,
      );
      await this.newsPicturesRepository.insert(preparedNewsPictures);
    }

    return newNews;
  }

  async findAll(input: NewsFilter) {
    const { page, take } = input;

    const [news, count] = await this.newsRepository
      .createQueryBuilder('n')
      .where(`n.deletedAt is null`)
      .orderBy('n.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(news, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    return await this.newsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['newsPictures'],
    });
  }

  async update(id: string, dto: UpdateNewsDto, updatedBy: string) {
    const { newsPictures, deleteNewsPictureIds, title, shortDesc, fullDesc } =
      dto;

    const existedNews = await this.newsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedNews)
      throw new HttpException('news not found', HttpStatus.BAD_REQUEST);

    if (newsPictures?.length > 0) {
      for (let i = 0; i < newsPictures?.length; i++) {
        await this.newsPicturesRepository.save(
          this.newsPicturesRepository.create({
            link: newsPictures[i],
            newsId: id,
          }),
        );
      }
    }

    if (deleteNewsPictureIds?.length > 0) {
      for (let i = 0; i < deleteNewsPictureIds?.length; i++) {
        await this.newsPicturesRepository.delete({
          id: deleteNewsPictureIds[i],
        });
      }
    }

    return await this.newsRepository.save({
      ...existedNews,
      title: title ?? existedNews.title,
      shortDesc: shortDesc ?? existedNews.shortDesc,
      fullDesc: fullDesc ?? existedNews.fullDesc,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedNews = await this.newsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedNews)
      throw new HttpException('news not found', HttpStatus.BAD_REQUEST);

    return await this.newsRepository.save({
      ...existedNews,
      deletedAt: moment().format(),
      deletedBy,
    });
  }

  private async prepareNewsPictures(newsPictures: string[], newsId: string) {
    return newsPictures?.map((newsPicture) => {
      return {
        newsId,
        link: newsPicture,
      };
    });
  }
}
