import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Movies } from 'src/entities/Movies';
import {
  CreateMovieDto,
  CreateMoviePoster,
  MovieFilter,
  UpdateMovieDto,
} from 'src/movies/dto/movies.dto';
import { MovieCategories } from 'src/entities/MovieCategories';
import { MovieParticipants } from 'src/entities/MovieParticipants';
import { People } from 'src/entities/People';
import { FilterMoviesEnum } from 'src/shared/movies.enum';
import { MoviePosters } from 'src/entities/MoviePosters';
import { CloudinaryService } from 'src/utils/cloudinary';

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
    @InjectRepository(MoviePosters)
    private moviePostersRepository: Repository<MoviePosters>,
    private readonly cloudinaryService: CloudinaryService,
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
      director,
      movieCategoryIds,
      movieParticipantIds,
      moviePosters,
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

    if (moviePosters?.length > 0) {
      const listMoviePoster = await this.prepareMoviePosters(
        moviePosters,
        movieId,
      );
      await this.moviePostersRepository.insert(listMoviePoster);
    }

    return newMovie;
  }

  async findAll(input: MovieFilter) {
    const {
      page,
      take,
      name,
      nation,
      categoryId,
      filterMovies,
      isNoPagination,
    } = input;

    let filter = undefined;
    let order = undefined;
    switch (filterMovies) {
      case FilterMoviesEnum.BANNER:
        filter = ` and m.isActive = true`;
        break;
      case FilterMoviesEnum.NOW_PLAYING:
        filter = ` and showings.startTime > :currentTime`;
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

    let builder = this.moviesRepository.createQueryBuilder('m');

    if (isNoPagination?.toString() === 'true') {
      return await builder
        .leftJoinAndSelect(
          'm.moviePosters',
          'moviePosters',
          'moviePosters.isThumb = true',
        )
        .select('m.id', 'id')
        .addSelect('m.name', 'name')
        .addSelect('moviePosters.link', 'linkPoster')
        .orderBy('m.id', 'DESC')
        .getRawMany();
      // .addSelect('moviePosters');
    } else {
      const [movies, count] = await builder
        .leftJoinAndSelect(
          'm.moviePosters',
          'moviePosters',
          'moviePosters.isThumb = true',
        )
        .leftJoinAndSelect('m.movieCategories', 'movieCategories')
        .leftJoin('m.filterMovieCategories', 'filterMovieCategories')
        .leftJoinAndSelect('movieCategories.category', 'category')
        .leftJoin(
          'm.showings',
          'showings',
          // `showings.startTime > :currentTime`,
          // {
          //   currentTime: new Date(),
          // },
        )
        .where(
          `
        m.deletedAt is null
        ${name ? ' and LOWER(m.name) like :name' : ''}
        ${nation ? ' and LOWER(m.nation) like :nation' : ''}
        ${
          categoryId
            ? ' and filterMovieCategories.categoryId = :categoryId'
            : ''
        }
        ${filter ?? ''}
        `,
          {
            ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
            ...(nation ? { nation: `%${nation.toLowerCase()}%` } : {}),
            ...(categoryId ? { categoryId } : {}),
            currentTime: new Date(),
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
  }

  async findOne(id: string) {
    const movie = await this.moviesRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.moviePosters', 'moviePosters')
      .leftJoinAndSelect('m.movieCategories', 'movieCategories')
      .leftJoinAndSelect('m.movieParticipants', 'movieParticipants')
      .leftJoinAndSelect('m.reviews', 'reviews')
      .leftJoinAndSelect('movieCategories.category', 'category')
      .leftJoinAndSelect('movieParticipants.people', 'people')
      .where('m.deletedAt is null and m.id = :movieId', {
        movieId: id,
      })
      .getOne();

    if (!movie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    return movie;
  }

  async update(id: string, dto: UpdateMovieDto, updatedBy: string) {
    const {
      name,
      duration,
      description,
      trailerLink,
      releaseDate,
      nation,
      isActive,
      director,
      addMovieCategoryIds,
      deleteMovieCategoryIds,
      addMovieParticipantIds,
      deleteMovieParticipantIds,
      addMoviePosters,
      deleteMoviePosterIds,
      thumbnailMoviePosterId,
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
      name,
      duration,
      description,
      trailerLink,
      nation,
      isActive,
      director,
      releaseDate: releaseDate
        ? moment(releaseDate).format('YYYY-MM-DD')
        : existedMovie.releaseDate,
      updatedAt: moment().format(),
      updatedBy,
    });

    if (addMovieCategoryIds?.length > 0) {
      const movieCategories = await this.prepareMovieCategories(
        addMovieCategoryIds,
        id,
      );
      await this.movieCategoriesRepository.insert(movieCategories);
    }

    if (addMovieParticipantIds?.length > 0) {
      const movieParticipants = await this.prepareMovieParticipants(
        addMovieParticipantIds,
        id,
      );
      await this.movieParticipantsRepository.insert(movieParticipants);
    }

    if (addMoviePosters?.length > 0) {
      const listMoviePoster = await this.prepareMoviePosters(
        addMoviePosters,
        id,
      );
      await this.moviePostersRepository.insert(listMoviePoster);
    }

    if (deleteMovieCategoryIds?.length > 0) {
      await this.movieCategoriesRepository.delete({
        movieId: id,
        categoryId: In(deleteMovieCategoryIds),
      });
    }

    if (deleteMovieParticipantIds?.length > 0) {
      await this.movieParticipantsRepository.delete({
        movieId: id,
        peopleId: In(deleteMovieParticipantIds),
      });
    }

    if (deleteMoviePosterIds?.length > 0) {
      const existedMoviePosters = await this.moviePostersRepository.find({
        where: {
          id: In(deleteMoviePosterIds),
        },
      });
      const listDeletedMoviePoster = existedMoviePosters?.map(
        (existedMoviePoster) => {
          const url = existedMoviePoster?.link;
          const secondToLastSlashIndex = url?.lastIndexOf(
            '/',
            url.lastIndexOf('/') - 1,
          );
          return url
            ?.slice(secondToLastSlashIndex + 1)
            ?.replace(/\.[^/.]+$/, '');
        },
      );

      await this.cloudinaryService.deletePicture(listDeletedMoviePoster);

      await this.moviePostersRepository.delete({
        id: In(deleteMoviePosterIds),
        movieId: id,
      });
    }

    if (thumbnailMoviePosterId) {
      const existedMoviePoster = await this.moviePostersRepository.findOne({
        where: {
          id: thumbnailMoviePosterId,
        },
      });
      if (existedMoviePoster) {
        await this.moviePostersRepository.update(
          {
            movieId: id,
          },
          {
            isThumb: false,
          },
        );
        await this.moviePostersRepository.save({
          ...existedMoviePoster,
          isThumb: true,
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
      });
    }

    return listMovieParticipant;
  }

  private async prepareMoviePosters(
    moviePosters: CreateMoviePoster[],
    movieId: string,
  ) {
    const prepareMoviePoster = [];
    for (let i = 0; i < moviePosters?.length; i++) {
      const moviePoster = moviePosters[i];
      const { base64, isThumb } = moviePoster;

      const createdPoster = await this.cloudinaryService.uploadMoviePoster(
        base64,
      );

      if (isThumb?.toString() === 'true') {
        await this.moviePostersRepository.update(
          {
            movieId,
          },
          {
            isThumb: false,
          },
        );
      }

      prepareMoviePoster.push({
        movieId,
        link: createdPoster?.url,
        isThumb,
      });
    }

    return prepareMoviePoster;
  }
}
