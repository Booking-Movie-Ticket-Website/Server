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
import { MovieCategories } from 'src/entities/MovieCategories';
import { MovieParticipants } from 'src/entities/MovieParticipants';
import { People } from 'src/entities/People';
import { FilterMoviesEnum } from 'src/shared/movies.enum';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movies)
    private moviesRepository: Repository<Movies>,
    @InjectRepository(People)
    private peopleRepository: Repository<People>,
    @InjectRepository(MovieCategories)
    private movieCategoriesRepository: Repository<MovieCategories>,
    @InjectRepository(MovieParticipants)
    private movieParticipantsRepository: Repository<MovieParticipants>,
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
      movieCategoryIds,
      movieParticipantIds,
    } = dto;
    if (!name)
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    const newMovie = await this.moviesRepository.save(
      this.moviesRepository.create({
        ...dto,
        releaseDate: moment(releaseDate).format('YYYY-MM-DD'),
        createdAt: moment().format(),
        createdBy,
      }),
    );

    const { id: movieId } = newMovie;

    if (movieCategoryIds?.length > 0) {
      const movieCategories = await this.prepareMovieCategories(
        movieCategoryIds,
        movieId,
      );
      await this.movieCategoriesRepository.insert(movieCategories);
    }

    if (movieParticipantIds?.length > 0) {
      const movieParticipants = await this.prepareMovieParticipants(
        movieParticipantIds,
        movieId,
      );
      await this.movieParticipantsRepository.insert(movieParticipants);
    }

    return newMovie;
  }

  async findAll(input: MovieFilter) {
    const { page, take, name, nation, filterMovies } = input;

    let filter = undefined;
    let order = undefined;
    switch (filterMovies) {
      case FilterMoviesEnum.NOW_PLAYING:
        filter = ` and m.isActive = true`;
        break;
      case FilterMoviesEnum.TOP_FEATURED:
        order = {
          content: `m.avrStars`,
          arrange: 'DESC',
        };
        break;
      case FilterMoviesEnum.COMING_SOON:
        filter = ` and m.releaseDate > '${moment().format('YYYY-MM-DD')}'`;
        order = {
          content: `m.releaseDate`,
          arrange: 'ASC',
        };
        break;
    }

    const [movies, count] = await this.moviesRepository
      .createQueryBuilder('m')
      .where(
        `
        m.deletedAt is null
        ${name ? ' and LOWER(m.name) like :name' : ''}
        ${nation ? ' and LOWER(m.nation) like :nation' : ''}
        ${filter ?? ''}
        `,
        {
          ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
          ...(nation ? { nation: `%${nation.toLowerCase()}%` } : {}),
        },
      )
      .orderBy(order?.content ?? 'm.id', order?.arrange ?? 'DESC')
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
      relations: [
        'moviePosters',
        'movieCategories',
        'movieParticipants',
        'reviews',
      ],
    });
    if (!movie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto, updatedBy: string) {
    const {
      releaseDate,
      movieCategoryIds,
      movieParticipantIds,
      deleteMovieCategoryIds,
      deleteMovieParticipantIds,
    } = dto;
    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);
    const updatedMovie = await this.moviesRepository.save({
      ...existedMovie,
      ...dto,
      releaseDate: releaseDate
        ? moment(releaseDate).format('YYYY-MM-DD')
        : existedMovie.releaseDate,
      updatedAt: moment().format(),
      updatedBy,
    });

    if (movieCategoryIds?.length > 0) {
      const movieCategories = await this.prepareMovieCategories(
        movieCategoryIds,
        id,
      );
      await this.movieCategoriesRepository.insert(movieCategories);
    }

    if (movieParticipantIds?.length > 0) {
      const movieParticipants = await this.prepareMovieParticipants(
        movieParticipantIds,
        id,
      );
      await this.movieParticipantsRepository.insert(movieParticipants);
    }

    if (deleteMovieCategoryIds?.length > 0) {
      for (let i = 0; i < deleteMovieCategoryIds?.length; i++) {
        await this.movieCategoriesRepository.delete({
          movieId: id,
          categoryId: deleteMovieCategoryIds[i],
        });
      }
    }

    if (deleteMovieParticipantIds?.length > 0) {
      for (let i = 0; i < deleteMovieParticipantIds?.length; i++) {
        await this.movieParticipantsRepository.delete({
          movieId: id,
          peopleId: deleteMovieParticipantIds[i],
        });
      }
    }

    return updatedMovie;
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

  private async prepareMovieCategories(
    movieCategoryIds: string[],
    movieId: string,
  ) {
    return movieCategoryIds?.map((movieCategoryId) => {
      return {
        movieId,
        categoryId: movieCategoryId,
      };
    });
  }

  private async prepareMovieParticipants(
    movieParticipantIds: string[],
    movieId: string,
  ) {
    const listMovieParticipant = [];
    for (let i = 0; i < movieParticipantIds?.length; i++) {
      const existedPerson = await this.peopleRepository.findOne({
        where: {
          id: movieParticipantIds[i],
          deletedAt: IsNull(),
        },
      });
      if (!existedPerson)
        throw new HttpException('person not found', HttpStatus.BAD_REQUEST);

      listMovieParticipant.push({
        movieId,
        peopleId: movieParticipantIds[i],
        profession: existedPerson.profession,
      });
    }

    return listMovieParticipant;
  }
}
