import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
    const { roomId, numberOfRow, numberOfColumn, seatType } = dto;
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

    for (let i = 0; i < numberOfRow; i++) {
      const row = convertNumberToCharacter(i);
      for (let j = 0; j < numberOfColumn; j++) {
        await this.seatsRepository.save(
          this.seatsRepository.create({
            roomId,
            seatRow: row,
            seatColumn: j + 1,
            type: seatType ?? SeatsEnum.STANDARD,
            createdAt: moment().format(),
            createdBy,
          }),
        );
      }
    }

    return await this.roomsRepository.save({
      ...existedRoom,
      capacity: numberOfRow * numberOfColumn,
      updatedAt: moment().format(),
      updatedBy: createdBy,
    });
  }

  async findAllOfARoom(input: SeatFilter) {
    const { page, take, roomId } = input;

    const [seats, count] = await this.roomsRepository
      .createQueryBuilder('s')
      .where(
        `
      r.deletedAt is null
      ${roomId ? ' and s.roomId = :roomId' : ''}
      `,
        {
          ...(roomId ? { roomId } : {}),
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

  async update(id: string, dto: UpdateSeatDto, updatedBy: string) {
    const existedSeat = await this.seatsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedSeat)
      throw new HttpException('seat not found', HttpStatus.BAD_REQUEST);

    return await this.seatsRepository.save({
      ...existedSeat,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedSeat = await this.seatsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedSeat)
      throw new HttpException('seat not found', HttpStatus.BAD_REQUEST);

    return await this.seatsRepository.save({
      ...existedSeat,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
