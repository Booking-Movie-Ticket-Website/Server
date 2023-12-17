import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Rooms } from 'src/entities/Rooms';
import { convertNumberToCharacter } from 'src/utils/common';
import { SeatsEnum } from 'src/shared/seats.enum';
import { Showings } from 'src/entities/Showings';
import {
  CreateShowingDto,
  ShowingFilter,
  UpdateShowingDto,
} from 'src/showings/dto/showings.dto';
import { Movies } from 'src/entities/Movies';
import { Theaters } from 'src/entities/Theaters';
import { ConfigService } from '@nestjs/config';
import { Seats } from 'src/entities/Seats';
import { ShowingSeats } from 'src/entities/ShowingSeats';

@Injectable()
export class ShowingsService {
  constructor(
    @InjectRepository(Movies)
    private moviesRepository: Repository<Movies>,
    @InjectRepository(Seats)
    private seatsRepository: Repository<Seats>,
    @InjectRepository(Rooms)
    private roomsRepository: Repository<Rooms>,
    @InjectRepository(Showings)
    private showingsRepository: Repository<Showings>,
    @InjectRepository(ShowingSeats)
    private showingSeatsRepository: Repository<ShowingSeats>,
    private readonly configService: ConfigService,
  ) {}
  async create(dto: CreateShowingDto, createdBy: string) {
    const { movieId, roomId, startTime } = dto;
    if (!movieId || !roomId || !startTime)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    const formattedStartTime = new Date(startTime);

    const { endTime } = await this.validateForShowing(
      null,
      movieId,
      roomId,
      formattedStartTime,
    );

    return await this.showingsRepository.save(
      this.showingsRepository.create({
        movieId,
        roomId,
        startTime: moment(formattedStartTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAllShowingOfAMovie(input: ShowingFilter) {
    const { page, take, isAvailable, movieId, theaterId, showingDate } = input;
    const [showings, count] = await this.showingsRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.room', 'room')
      .where(
        `
        s.deletedAt is null
        ${
          isAvailable.toString() === 'true'
            ? ' and s.startTime > :currentTime'
            : ''
        }
        ${movieId ? ' and s.movieId = :movieId' : ''}
        ${theaterId ? ' and room.theaterId = :theaterId' : ''}
        ${
          showingDate
            ? ' and s.startTime between :startShowingDate and  :endShowingDate'
            : ''
        }
      `,
        {
          ...(isAvailable.toString() === 'true'
            ? { currentTime: new Date() }
            : {}),
          ...(movieId ? { movieId } : {}),
          ...(theaterId ? { theaterId } : {}),
          ...(showingDate
            ? { startShowingDate: new Date(`${showingDate}T00:00:00Z`) }
            : {}),
          ...(showingDate
            ? { endShowingDate: new Date(`${showingDate}T23:59:59Z`) }
            : {}),
        },
      )
      .orderBy('s.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(showings, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    const existedShowing = await this.showingsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['movie', 'room'],
    });

    if (!existedShowing)
      throw new HttpException('showing not found', HttpStatus.BAD_REQUEST);

    const seats = await this.seatsRepository.find({
      where: {
        roomId: existedShowing?.roomId,
        deletedAt: IsNull(),
      },
      order: {
        seatRow: 'ASC',
        seatColumn: 'ASC',
      },
    });

    const showingSeats = await this.showingSeatsRepository.find({
      where: {
        showingId: id,
      },
      select: ['seatId'],
    });

    const bookedSeatIds = showingSeats?.map(
      (showingSeat) => showingSeat.seatId,
    );

    const checkShowingSeatsBooked = seats.map((seat) => {
      const { id } = seat;
      return {
        ...seat,
        isBooked: bookedSeatIds?.includes(id) ? true : false,
      };
    });

    return {
      ...existedShowing,
      showingSeats: checkShowingSeatsBooked,
    };
  }

  async update(id: string, dto: UpdateShowingDto, updatedBy: string) {
    const { movieId, roomId, startTime } = dto;
    const existedShowing = await this.showingsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedShowing)
      throw new HttpException('showing not found', HttpStatus.BAD_REQUEST);

    const formattedStartTime = new Date(startTime ?? existedShowing.startTime);
    const { endTime } = await this.validateForShowing(
      id,
      movieId ?? existedShowing?.movieId,
      roomId ?? existedShowing?.roomId,
      formattedStartTime,
    );

    return await this.showingsRepository.save({
      ...existedShowing,
      ...dto,
      startTime: moment(formattedStartTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedShowing = await this.showingsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedShowing)
      throw new HttpException('showing not found', HttpStatus.BAD_REQUEST);

    return await this.showingsRepository.save({
      ...existedShowing,
      deletedAt: moment().format(),
      deletedBy,
    });
  }

  private async validateForShowing(
    showingId: string,
    movieId: string,
    roomId: string,
    startTime: Date,
  ) {
    const existedMovie = await this.moviesRepository.findOne({
      where: {
        id: movieId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });
    if (!existedMovie)
      throw new HttpException('movie not found', HttpStatus.BAD_REQUEST);

    const existedRoom = await this.roomsRepository.findOne({
      where: {
        id: roomId,
        deletedAt: IsNull(),
      },
    });
    if (!existedRoom)
      throw new HttpException('room not found', HttpStatus.BAD_REQUEST);

    const currentDate = new Date();

    if (startTime <= currentDate)
      throw new HttpException(
        'the start time of showing must be in the future',
        HttpStatus.BAD_REQUEST,
      );

    const endTime = new Date(
      startTime.getTime() + existedMovie?.duration * 60000,
    );

    const startTimeForPrepare = new Date(
      startTime.getTime() -
        this.configService.get<number>('TIME_FOR_PREPARING_SHOWING') * 60000,
    );
    const endTimeForPrepare = new Date(
      endTime.getTime() +
        this.configService.get<number>('TIME_FOR_PREPARING_SHOWING') * 60000,
    );

    const checkAvailableRoom = await this.showingsRepository
      .createQueryBuilder('s')
      .where(
        `s.deletedAt is null
        ${showingId ? ' and s.id not in (:showingId)' : ''}
        ${roomId ? ' and s.roomId = :roomId' : ''}
        ${
          startTimeForPrepare && endTimeForPrepare
            ? ` and ((s.startTime > :startTimeForPrepare and s.startTime < :endTimeForPrepare) or (s.endTime > :startTimeForPrepare and s.endTime < :endTimeForPrepare))`
            : ''
        }
        `,
        {
          ...(showingId ? { showingId } : {}),
          ...(roomId ? { roomId } : {}),
          ...(startTimeForPrepare ? { startTimeForPrepare } : {}),
          ...(endTimeForPrepare ? { endTimeForPrepare } : {}),
        },
      )
      .getMany();

    if (checkAvailableRoom?.length > 0)
      throw new HttpException('invalid showing time', HttpStatus.BAD_REQUEST);

    return {
      endTime,
    };
  }
}
