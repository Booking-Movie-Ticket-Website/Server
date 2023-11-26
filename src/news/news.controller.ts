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
import { CreateNewsDto, NewsFilter, UpdateNewsDto } from './dto/news.dto';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Req() req, @Body() dto: CreateNewsDto) {
    const { id: createdBy } = req.user;
    const newNews = await this.newsService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newNews,
    };
  }

  @Get()
  async findAll(@Query() input: NewsFilter) {
    return await this.newsService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.newsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedNews = await this.newsService.update(id, dto, updatedBy);

    return {
      message: 'update successfully',
      updatedNews,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedNews = await this.newsService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedNews,
    };
  }
}
