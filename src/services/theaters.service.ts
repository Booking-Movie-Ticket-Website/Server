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
import { Theaters } from 'src/entities/Theaters';
import {
  CreateTheaterDto,
  TheaterFilter,
  UpdateTheaterDto,
} from 'src/theaters/dto/theaters.dto';

@Injectable()
export class TheatersService {
  constructor(
    @InjectRepository(Theaters)
    private theatersRepository: Repository<Theaters>,
  ) {}
  async create(dto: CreateTheaterDto, createdBy: string) {
    const { name, city, address } = dto;
    if (!name || !city || !address)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    return await this.theatersRepository.save(
      this.theatersRepository.create({
        ...dto,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: TheaterFilter) {
    const { page, take, movieId, showingDate } = input;

    const [theaters, count] = await this.theatersRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.rooms', 'rooms', 'rooms.deletedAt is null')
      .leftJoinAndSelect(
        'rooms.showings',
        'showings',
        'showings.deletedAt is null',
      )
      .where(
        `
          t.deletedAt is null
          ${movieId ? ' and showings.movieId = :movieId' : ''}
          ${
            showingDate
              ? ' and showings.startTime between :startShowingDate and  :endShowingDate'
              : ''
          }
        `,
        {
          ...(movieId ? { movieId } : {}),
          ...(showingDate
            ? { startShowingDate: new Date(`${showingDate}T00:00:00Z`) }
            : {}),
          ...(showingDate
            ? { endShowingDate: new Date(`${showingDate}T23:59:59Z`) }
            : {}),
        },
      )
      .orderBy('t.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(theaters, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    return await this.theatersRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.rooms', 'rooms', 'rooms.deletedAt is null')
      .where(`t.id = :id and t.deletedAt is null`, {
        id,
      })
      .getOne();
  }

  async update(id: string, dto: UpdateTheaterDto, updatedBy: string) {
    const existedTheater = await this.theatersRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedTheater)
      throw new HttpException('theater not found', HttpStatus.BAD_REQUEST);

    return await this.theatersRepository.save({
      ...existedTheater,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedTheater = await this.theatersRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedTheater)
      throw new HttpException('theater not found', HttpStatus.BAD_REQUEST);

    return await this.theatersRepository.save({
      ...existedTheater,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
