import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Not, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Rooms } from 'src/entities/Rooms';
import { SeatsEnum } from 'src/shared/seats.enum';
import { Showings } from 'src/entities/Showings';
import { Movies } from 'src/entities/Movies';
import { ConfigService } from '@nestjs/config';
import { Seats } from 'src/entities/Seats';
import { ShowingSeats } from 'src/entities/ShowingSeats';
import {
  BookingFilter,
  CreateBookingDto,
  UpdateBookingDto,
} from 'src/bookings/dto/bookings.dto';
import { Bookings } from 'src/entities/Bookings';
import { StatusesEnum } from 'src/shared/statuses.enum';

@Injectable()
export class BookingsService {
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
    @InjectRepository(Bookings)
    private bookingsRepository: Repository<Bookings>,
    private readonly configService: ConfigService,
  ) {}
  async create(dto: CreateBookingDto, userId: string, createdBy: string) {
    const { showingId, seatIds } = dto;
    const existedShowing = await this.showingsRepository.findOne({
      where: {
        id: showingId,
        startTime: MoreThan(new Date()),
        deletedAt: IsNull(),
      },
    });
    if (!existedShowing)
      throw new HttpException('showing not found', HttpStatus.BAD_REQUEST);

    const existedSeats = await this.seatsRepository.find({
      where: {
        id: In(seatIds),
        deletedAt: IsNull(),
      },
    });
    if (existedSeats?.length !== seatIds?.length)
      throw new HttpException('invalid booking seats', HttpStatus.BAD_REQUEST);

    const existedShowingSeats = await this.showingSeatsRepository.find({
      where: {
        showingId,
        seatId: In(seatIds),
      },
    });
    if (existedShowingSeats?.length > 0)
      throw new HttpException(
        'seat(s) has been booked',
        HttpStatus.BAD_REQUEST,
      );

    await this.validateCoupleSeat(existedSeats, seatIds);

    console.log(existedSeats);

    const total = existedSeats?.reduce((sum, seat) => {
      const { type } = seat;
      return (
        +sum +
        +(type === SeatsEnum.STANDARD
          ? this.configService.get<number>('STANDARD_SEAT_PRICE')
          : this.configService.get<number>('SINGLE_COUPLE_SEAT_PRICE'))
      );
    }, 0);

    const newBooking = await this.bookingsRepository.save(
      this.bookingsRepository.create({
        userId,
        showingId,
        totalPrice: total,
        status: StatusesEnum.CREATED,
        createdAt: moment().format(),
        createdBy,
      }),
    );

    const { id: bookingId } = newBooking;

    const listShowingSeat = [];
    for (let i = 0; i < seatIds?.length; i++) {
      const { type } = existedSeats[i];
      const newShowingSeat = this.showingSeatsRepository.create({
        showingId,
        seatId: seatIds[i],
        type,
        price:
          type === SeatsEnum.STANDARD
            ? this.configService.get<number>('STANDARD_SEAT_PRICE')
            : this.configService.get<number>('COUPLE_SEAT_PRICE') / 2,
        bookingId,
      });

      listShowingSeat.push(newShowingSeat);
    }

    await this.showingSeatsRepository.insert(listShowingSeat);

    return newBooking;
  }

  async findAll(input: BookingFilter) {
    const { page, take, userId } = input;
    const [bookings, count] = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user', 'user.deletedAt is null')
      .leftJoinAndSelect('b.showing', 'showing', 'showing.deletedAt is null')
      .where(
        `
        b.deletedAt is null
        ${userId ? ' and b.userId = :userId' : ''}
      `,
        {
          ...(userId ? { userId } : {}),
        },
      )
      .orderBy('b.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(bookings, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findAllMyBookings(userId: string) {
    return await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'user', 'user.deletedAt is null')
      .leftJoinAndSelect('b.showing', 'showing', 'showing.deletedAt is null')
      .where(
        `
        b.deletedAt is null
        ${userId ? ' and b.userId = :userId' : ''}
      `,
        {
          ...(userId ? { userId } : {}),
        },
      )
      .orderBy('b.id', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string, roleId: string) {
    const existedBooking = await this.bookingsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['user', 'showing', 'showingSeats'],
    });

    if (!existedBooking)
      throw new HttpException('booking not found', HttpStatus.BAD_REQUEST);

    if (userId !== existedBooking?.userId && roleId !== '1')
      throw new HttpException('unauthorized', HttpStatus.UNAUTHORIZED);

    return existedBooking;
  }

  async update(id: string, dto: UpdateBookingDto, updatedBy: string) {
    const { status } = dto;

    const existedBooking = await this.findOne(id, null, updatedBy);
    const { status: currentStatus } = existedBooking;

    await this.validateStatus(currentStatus, status);

    return await this.bookingsRepository.save({
      ...existedBooking,
      status,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  private async validateCoupleSeat(seats: Seats[], seatIds: string[]) {
    for (let i = 0; i < seats?.length; i++) {
      const { type, pairWith } = seats[i];
      if (type === SeatsEnum.COUPLE) {
        if (!seatIds?.includes(pairWith.toString()))
          throw new HttpException(
            'invalid couple seat',
            HttpStatus.BAD_REQUEST,
          );
      }
    }
  }

  private async validateStatus(currentStatus: string, nextStatus) {
    if (currentStatus === StatusesEnum.CANCELED)
      throw new HttpException(
        'Cannot update status of canceled order',
        HttpStatus.BAD_REQUEST,
      );

    if (
      currentStatus === StatusesEnum.PAYED &&
      nextStatus === StatusesEnum.CANCELED
    )
      throw new HttpException(
        'Cannot cancel payed order',
        HttpStatus.BAD_REQUEST,
      );

    if (
      currentStatus === StatusesEnum.COMPLETED &&
      nextStatus === StatusesEnum.CANCELED
    )
      throw new HttpException(
        'Cannot cancel completed order',
        HttpStatus.BAD_REQUEST,
      );
  }
}
