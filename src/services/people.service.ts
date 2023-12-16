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
import { People } from 'src/entities/People';
import {
  CreatePersonDto,
  PeopleFilter,
  UpdatePersonDto,
} from 'src/people/dto/people.dto';
import { CloudinaryService } from 'src/utils/cloudinary';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(People)
    private peopleRepository: Repository<People>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(dto: CreatePersonDto, createdBy: string) {
    const { base64ProfilePicture } = dto;
    const createdPersonAvatar = await this.cloudinaryService.uploadActorAvatar(
      base64ProfilePicture,
    );

    return await this.peopleRepository.save(
      this.peopleRepository.create({
        ...dto,
        profilePicture: createdPersonAvatar?.url,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: PeopleFilter) {
    const { page, take, name } = input;

    const [people, count] = await this.peopleRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.movieParticipants', 'movieParticipants')
      .where(
        `p.deletedAt is null
        ${name ? ' and LOWER(p.name) like :name' : ''}`,
        {
          ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
        },
      )
      .orderBy('p.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(people, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findAllNoPagination() {
    return await this.peopleRepository
      .createQueryBuilder('p')
      .where(`p.deletedAt is null`)
      .select('p.id', 'id')
      .addSelect('p.fullName', 'fullName')
      .addSelect('p.profilePicture', 'profilePicture')
      .orderBy('p.fullName', 'ASC')
      .getRawMany();
  }

  async findOne(id: string) {
    const person = await this.peopleRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['movieParticipants'],
    });
    if (!person)
      throw new HttpException('person not found', HttpStatus.BAD_REQUEST);

    return person;
  }

  async update(id: string, dto: UpdatePersonDto, updatedBy: string) {
    // const { name, isAccessCms, isActive } = dto;

    const existedPerson = await this.peopleRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedPerson)
      throw new HttpException('person not found', HttpStatus.BAD_REQUEST);

    return await this.peopleRepository.save({
      ...existedPerson,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedPerson = await this.peopleRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedPerson)
      throw new HttpException('person not found', HttpStatus.BAD_REQUEST);

    return await this.peopleRepository.save({
      ...existedPerson,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
