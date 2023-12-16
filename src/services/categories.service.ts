import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as moment from 'moment';
import {
  PageMetaDto,
  PaginationDto,
  getSkip,
} from 'src/shared/pagination/pagination.dto';
import { Categories } from 'src/entities/Categories';
import {
  CategoryFilter,
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'src/categories/dto/categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
  ) {}
  async create(dto: CreateCategoryDto, createdBy: string) {
    return await this.categoriesRepository.save(
      this.categoriesRepository.create({
        ...dto,
        createdAt: moment().format(),
        createdBy,
      }),
    );
  }

  async findAll(input: CategoryFilter) {
    const { page, take, name } = input;

    const [categories, count] = await this.categoriesRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.categoryPictures', 'categoryPictures')
      .leftJoinAndSelect('c.movieCategories', 'movieCategories')
      .where(
        `c.deletedAt is null
        ${name ? ' and LOWER(c.name) like :name' : ''}`,
        {
          ...(name ? { name: `%${name.toLowerCase()}%` } : {}),
        },
      )
      .orderBy('c.name', 'ASC')
      .take(take)
      .skip(getSkip({ page, take }))
      .getManyAndCount();

    return new PaginationDto(categories, <PageMetaDto>{
      page,
      take,
      totalCount: count,
    });
  }

  async findAllNoPagination() {
    return await this.categoriesRepository
      .createQueryBuilder('c')
      .where(`c.deletedAt is null`)
      .select('c.id', 'id')
      .addSelect('c.name', 'name')
      .orderBy('c.name', 'ASC')
      .getRawMany();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['categoryPictures', 'movieCategories'],
    });
    if (!category)
      throw new HttpException('category not found', HttpStatus.BAD_REQUEST);

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, updatedBy: string) {
    const { name } = dto;

    const existedCategory = await this.categoriesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedCategory)
      throw new HttpException('category not found', HttpStatus.BAD_REQUEST);

    return await this.categoriesRepository.save({
      ...existedCategory,
      ...dto,
      updatedAt: moment().format(),
      updatedBy,
    });
  }

  async remove(id: string, deletedBy: string) {
    const existedCategory = await this.categoriesRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
    if (!existedCategory)
      throw new HttpException('category not found', HttpStatus.BAD_REQUEST);

    return await this.categoriesRepository.save({
      ...existedCategory,
      deletedAt: moment().format(),
      deletedBy,
    });
  }
}
