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

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}
  async create(dto: CreateRoleDto, createdBy: string) {
    return await this.rolesRepository.save(
      this.rolesRepository.create({
        ...dto,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: RoleFilter) {
    const { page, take, name } = input;

    const [roles, count] = await this.rolesRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.users', 'users')
      .where(
        `r.deletedAt is null
        ${name ? ' and LOWER(r.name) like :name' : ''}`,
        {
          ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
        },
      )
      .orderBy('r.id', 'DESC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(roles, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['users'],
    });
    if (!role)
      throw new HttpException('role not found', HttpStatus.BAD_REQUEST);

    return role;
  }

  async update(id: string, dto: UpdateRoleDto, updatedBy: string) {
    const { name, isAccessCms, isActive } = dto;

    const existedRole = await this.rolesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedRole)
      throw new HttpException('role not found', HttpStatus.BAD_REQUEST);

    return await this.rolesRepository.save({
      ...existedRole,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedRole = await this.rolesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedRole)
      throw new HttpException('role not found', HttpStatus.BAD_REQUEST);

    return await this.rolesRepository.save({
      ...existedRole,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
