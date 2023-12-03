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
import { CreateSeatDto, SeatFilter, UpdateSeatDto } from './dto/seats.dto';
import { SeatsService } from 'src/services/seats.service';

@ApiTags('seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Req() req, @Body() dto: CreateSeatDto) {
    const { id: createdBy } = req.user;
    const updatedRoom = await this.seatsService.create(dto, createdBy);
    return {
      message: 'create successfully',
      updatedRoom,
    };
  }

  @Get()
  async findAll(@Query() input: SeatFilter) {
    return await this.seatsService.findAllOfARoom(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.seatsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateSeatDto,
  ) {
    const { id: updatedBy } = req.user;
    const updateSeat = await this.seatsService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updateSeat,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedSeat = await this.seatsService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedSeat,
    };
  }
}
