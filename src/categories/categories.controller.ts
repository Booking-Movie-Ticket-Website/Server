import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CategoriesService } from 'src/services/categories.service';
import {
  CategoryFilter,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateCategoryDto) {
    const { id: createdBy } = req.user;
    const newRole = await this.categoriesService.create(dto, createdBy);
    return {
      message: 'new category created successfully',
      newRole,
    };
  }

  @Get()
  async findAll(@Query() input: CategoryFilter) {
    return await this.categoriesService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedRole = await this.categoriesService.update(id, dto, updatedBy);

    return {
      message: 'category updated successfully',
      updatedRole,
    };
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedRole = await this.categoriesService.remove(id, deletedBy);
    return {
      message: 'category deleted successfully',
      deletedRole,
    };
  }
}
