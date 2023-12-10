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
import {
  CreateShowingDto,
  ShowingFilter,
  UpdateShowingDto,
} from './dto/showings.dto';
import { SeatsService } from 'src/services/seats.service';
import { ShowingsService } from 'src/services/showings.service';

@ApiTags('showings')
@Controller('showings')
export class ShowingsController {
  constructor(private readonly showingsService: ShowingsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Req() req, @Body() dto: CreateShowingDto) {
    const { id: createdBy } = req.user;
    const newShowing = await this.showingsService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newShowing,
    };
  }

  @Get()
  async findAllShowingOfAMovie(@Query() input: ShowingFilter) {
    return await this.showingsService.findAllShowingOfAMovie(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.showingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateShowingDto,
  ) {
    const { id: updatedBy } = req.user;
    const updateSeat = await this.showingsService.update(id, dto, updatedBy);

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
    const deletedShowing = await this.showingsService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedShowing,
    };
  }
}
