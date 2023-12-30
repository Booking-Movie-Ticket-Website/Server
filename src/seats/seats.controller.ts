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
  @Patch('update-to-type-couple')
  async update(@Req() req, @Body() dto: UpdateSeatDto) {
    const { id: updatedBy } = req.user;
    await this.seatsService.updateToTypeCouple(dto, updatedBy);

    return {
      message: 'update successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':roomId')
  async remove(@Req() req, @Param('roomId') roomId: string) {
    const { id: deletedBy } = req.user;
    const deletedSeat = await this.seatsService.remove(roomId, deletedBy);
    return {
      message: 'delete successfully',
      deletedSeat,
    };
  }
}
