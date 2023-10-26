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
import { CreateMovieDto, MovieFilter, UpdateMovieDto } from './dto/movies.dto';
import { MoviesService } from 'src/services/movies.service';

@ApiTags('movies')
@Controller('movies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateMovieDto) {
    const { id: createdBy } = req.user;
    const newPerson = await this.moviesService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newPerson,
    };
  }

  @Get()
  async findAll(@Query() input: MovieFilter) {
    return await this.moviesService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.moviesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedPerson = await this.moviesService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updatedPerson,
    };
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedPerson = await this.moviesService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedPerson,
    };
  }
}
