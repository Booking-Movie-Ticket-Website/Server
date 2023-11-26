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
import { PeopleService } from 'src/services/people.service';
import {
  CreatePersonDto,
  PeopleFilter,
  UpdatePersonDto,
} from './dto/people.dto';

@ApiTags('people')
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Req() req, @Body() dto: CreatePersonDto) {
    const { id: createdBy } = req.user;
    const newPerson = await this.peopleService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newPerson,
    };
  }

  @Get()
  async findAll(@Query() input: PeopleFilter) {
    return await this.peopleService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.peopleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedPerson = await this.peopleService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updatedPerson,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedPerson = await this.peopleService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedPerson,
    };
  }
}
