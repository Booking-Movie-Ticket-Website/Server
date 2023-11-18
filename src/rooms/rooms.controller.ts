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
import { TheatersService } from 'src/services/theaters.service';
import { CreateRoomDto, RoomFilter, UpdateRoomDto } from './dto/rooms.dto';
import { RoomsService } from 'src/services/rooms.service';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateRoomDto) {
    const { id: createdBy } = req.user;
    const newTheater = await this.roomsService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newTheater,
    };
  }

  @Get()
  async findAll(@Query() input: RoomFilter) {
    return await this.roomsService.findAllOfATheater(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.roomsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    const { id: updatedBy } = req.user;
    const updateRoom = await this.roomsService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updateRoom,
    };
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedRoom = await this.roomsService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedRoom,
    };
  }
}
