import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateRoleDto,
  RoleFilter,
  UpdateRoleDto,
} from '../roles/dto/roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Roles } from 'src/entities/Roles';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Movies } from 'src/entities/Movies';
import {
  CreateMovieDto,
  MovieFilter,
  UpdateMovieDto,
} from 'src/movies/dto/movies.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movies)
    private moviesRepository: Repository<Movies>,
  ) {}
  async create(dto: CreateMovieDto, createdBy: string) {
    const {
      name,
      duration,
      description,
      trailerLink,
      releaseDate,
      nation,
      isActive,
    } = dto;
    if (!name)
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    return await this.moviesRepository.save(
      this.moviesRepository.create({
        ...dto,
        releaseDate: moment(releaseDate).format('YYYY-MM-DD'),
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: MovieFilter) {
    const { page, take, name, nation } = input;

    const [movies, count] = await this.moviesRepository
      .createQueryBuilder('m')
      .where(
        `
        p.deletedAt is null
        ${name ? ' and LOWER(p.name) like :name' : ''}
        ${nation ? ' and LOWER(p.nation) like :nation' : ''}
        `,
        {
          ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
          ...(nation ? { nation: `%${nation.toLowerCase()}%` } : {}),
        },
      )
      .orderBy('p.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(movies, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    const movie = await this.moviesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['movieParticipants'],
    });
    if (!movie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto, updatedBy: string) {
    const { releaseDate } = dto;
    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);
    return await this.moviesRepository.save({
      ...existedMovie,
      ...dto,
      releaseDate: releaseDate
        ? moment(releaseDate).format('YYYY-MM-DD')
        : existedMovie.releaseDate,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    return await this.moviesRepository.save({
      ...existedMovie,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
