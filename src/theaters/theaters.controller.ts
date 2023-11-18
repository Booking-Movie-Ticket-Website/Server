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
import { NewsService } from 'src/services/news.service';
import { TheatersService } from 'src/services/theaters.service';
import {
  CreateTheaterDto,
  TheaterFilter,
  UpdateTheaterDto,
} from './dto/theaters.dto';

@ApiTags('theaters')
@Controller('theaters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TheatersController {
  constructor(private readonly theatersService: TheatersService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateTheaterDto) {
    const { id: createdBy } = req.user;
    const newTheater = await this.theatersService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newTheater,
    };
  }

  @Get()
  async findAll(@Query() input: TheaterFilter) {
    return await this.theatersService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.theatersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateTheaterDto,
  ) {
    const { id: updatedBy } = req.user;
    const updateTheater = await this.theatersService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updateTheater,
    };
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedTheater = await this.theatersService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedTheater,
    };
  }
}
