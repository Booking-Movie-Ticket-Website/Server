import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Rooms } from 'src/entities/Rooms';
import { Seats } from 'src/entities/Seats';
import {
  CreateSeatDto,
  SeatFilter,
  UpdateSeatDto,
} from 'src/seats/dto/seats.dto';
import { convertNumberToCharacter } from 'src/utils/common';
import { SeatsEnum } from 'src/shared/seats.enum';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Rooms)
    private roomsRepository: Repository<Rooms>,
    @InjectRepository(Seats)
    private seatsRepository: Repository<Seats>,
  ) {}
  async create(dto: CreateSeatDto, createdBy: string) {
    const { roomId, numberOfRow, numberOfColumn } = dto;
    if (!roomId || !numberOfRow || !numberOfColumn)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    const existedRoom = await this.roomsRepository.findOne({
      where: {
        id: roomId,
        deletedAt: IsNull(),
      },
    });
    if (!existedRoom)
      throw new HttpException('room not found', HttpStatus.BAD_REQUEST);

    const prepareListSeat = [];
    for (let i = 0; i < numberOfRow; i++) {
      const row = convertNumberToCharacter(i);
      for (let j = 0; j < numberOfColumn; j++) {
        prepareListSeat.push({
          roomId,
          seatRow: row,
          seatColumn: j + 1,
          type: SeatsEnum.STANDARD,
          createdAt: moment().format(),
          createdBy,
        });
      }
    }

    await this.seatsRepository.insert(prepareListSeat);

    return await this.roomsRepository.save({
      ...existedRoom,
      capacity: +numberOfRow * +numberOfColumn,
      updatedAt: moment().format(),
      updatedBy: createdBy,
    });
  }

  async findAllOfARoom(input: SeatFilter) {
    const { page, take, roomId, seatType } = input;

    const [seats, count] = await this.seatsRepository
      .createQueryBuilder('s')
      .where(
        `
      s.deletedAt is null
      ${roomId ? ' and s.roomId = :roomId' : ''}
      ${seatType ? ' and s.type = :seatType' : ''}
      `,
        {
          ...(roomId ? { roomId } : {}),
          ...(seatType ? { seatType } : {}),
        },
      )
      .orderBy('s.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(seats, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    return await this.seatsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['room'],
    });
  }

  async updateToTypeCouple(dto: UpdateSeatDto, updatedBy: string) {
    const { firstSeatId, secondSeatId } = dto;
    if (!firstSeatId || !secondSeatId)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    const seatList = [firstSeatId, secondSeatId];
    const existedSeats = await this.seatsRepository.find({
      where: {
        id: In(seatList),
        deletedAt: IsNull(),
      },
    });
    if (existedSeats?.length !== 2)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    for (let i = 0; i < existedSeats?.length; i++) {
      const { pairWith } = existedSeats[i];
      if (pairWith && !seatList?.includes(pairWith?.toString())) {
        throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);
      }
    }

    for (let i = 0; i < existedSeats?.length; i++) {
      const updatedSeat = existedSeats[i];
      const { id } = updatedSeat;
      await this.seatsRepository.save({
        ...updatedSeat,
        pairWith: +seatList?.find((seat) => seat !== id),
        type: SeatsEnum.COUPLE,
        updatedAt: moment().format(),
        updatedBy,
      });
    }
  }

  async remove(roomId: string, deletedBy: string) {
    const existedRoom = await this.roomsRepository.findOne({
      where: {
        id: roomId,
        deletedAt: IsNull(),
      },
    });
    if (!existedRoom)
      throw new HttpException('room not found', HttpStatus.BAD_REQUEST);

    await this.seatsRepository.update(
      {
        roomId,
      },
      {
        deletedAt: moment().format(),
        deletedBy,
      },
    );

    return await this.roomsRepository.save({
      ...existedRoom,
      capacity: 0,
      updatedAt: moment().format(),
      updatedBy: deletedBy,
    });
  }
}
