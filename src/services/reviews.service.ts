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

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Reviews)
    private reviewsRepository: Repository<Reviews>,
    @InjectRepository(Movies)
    private moviesRepository: Repository<Movies>,
  ) {}
  async create(dto: CreateReviewDto, createdBy: string) {
    const { movieId, star } = dto;

    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id: movieId,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    if (!star) throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    return await this.reviewsRepository.save(
      this.reviewsRepository.create({
        ...dto,
        movieId,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: ReviewFilter) {
    const { page, take } = input;

    const [reviews, count] = await this.reviewsRepository
      .createQueryBuilder('r')
      .where(`r.deletedAt is null`)
      .orderBy('r.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(reviews, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findAllByMovie(movieId: string) {
    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id: movieId,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    return await this.reviewsRepository.find({
      where: {
        movieId,
        deletedAt: IsNull(),
      },
    });
  }

  async update(id: string, dto: UpdateReviewDto, updatedBy: string) {
    const existedReview = await this.reviewsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedReview)
      throw new HttpException('review not found', HttpStatus.BAD_REQUEST);

    return await this.reviewsRepository.save({
      ...existedReview,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedReview = await this.reviewsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedReview)
      throw new HttpException('review not found', HttpStatus.BAD_REQUEST);

    return await this.reviewsRepository.save({
      ...existedReview,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
