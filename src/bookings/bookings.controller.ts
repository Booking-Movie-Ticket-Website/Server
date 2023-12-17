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
import { BookingsService } from 'src/services/bookings.service';
import {
  BookingFilter,
  CreateBookingDto,
  UpdateBookingDto,
} from './dto/bookings.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateBookingDto) {
    const { id: createdBy } = req.user;
    const newBooking = await this.bookingsService.create(
      dto,
      createdBy,
      createdBy,
    );
    return {
      message: 'create successfully',
      newBooking,
    };
  }

  @Get()
  async findAll(@Query() input: BookingFilter) {
    return await this.bookingsService.findAll(input);
  }

  @Get('my-bookings')
  async findAllMyBookings(@Req() req) {
    const { id: userId } = req.user;
    return await this.bookingsService.findAllMyBookings(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.bookingsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedBooking = await this.bookingsService.update(
      id,
      dto,
      updatedBy,
    );

    return {
      message: 'update successfully',
      updatedBooking,
    };
  }
}
