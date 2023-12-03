import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Theaters } from 'src/entities/Theaters';
import { Rooms } from 'src/entities/Rooms';
import {
  CreateRoomDto,
  RoomFilter,
  UpdateRoomDto,
} from 'src/rooms/dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Rooms)
    private roomsRepository: Repository<Rooms>,
    @InjectRepository(Theaters)
    private theatersRepository: Repository<Theaters>,
  ) {}
  async create(dto: CreateRoomDto, createdBy: string) {
    const { theaterId, name, capacity, type } = dto;
    if (!theaterId || !name || !type)
      throw new HttpException('invalid input', HttpStatus.BAD_REQUEST);

    const existedTheater = await this.theatersRepository.findOne({
      where: {
        id: theaterId,
        deletedAt: IsNull(),
      },
    });
    if (!existedTheater)
      throw new HttpException('theater not found', HttpStatus.BAD_REQUEST);

    return await this.roomsRepository.save(
      this.roomsRepository.create({
        ...dto,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAllOfATheater(input: RoomFilter) {
    const { page, take, theaterId } = input;

    const [rooms, count] = await this.roomsRepository
      .createQueryBuilder('r')
      .where(
        `
      r.deletedAt is null
      ${theaterId ? ' and r.theaterId = :theaterId' : ''}
      `,
        {
          ...(theaterId ? { theaterId } : {}),
        },
      )
      .orderBy('r.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(rooms, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    return await this.roomsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['rooms', 'showings'],
    });
  }

  async update(id: string, dto: UpdateRoomDto, updatedBy: string) {
    const existedRoom = await this.roomsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedRoom)
      throw new HttpException('room not found', HttpStatus.BAD_REQUEST);

    return await this.roomsRepository.save({
      ...existedRoom,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedRoom = await this.roomsRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedRoom)
      throw new HttpException('room not found', HttpStatus.BAD_REQUEST);

    return await this.roomsRepository.save({
      ...existedRoom,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
