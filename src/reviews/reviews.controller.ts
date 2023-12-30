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
import { ReviewsService } from 'src/services/reviews.service';
import {
  CreateReviewDto,
  ReviewFilter,
  UpdateReviewDto,
} from './dto/reviews.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Req() req, @Body() dto: CreateReviewDto) {
    const { id: createdBy } = req.user;
    const newReview = await this.reviewsService.create(dto, createdBy);
    return {
      message: 'create successfully',
      newReview,
    };
  }

  @Get()
  async findAll(@Query() input: ReviewFilter) {
    return await this.reviewsService.findAll(input);
  }

  @Get(':movieId')
  async findAllByMovie(@Param('movieId') id: string) {
    return await this.reviewsService.findAllByMovie(id);
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @Patch(':id')
  // async update(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() dto: UpdateReviewDto,
  // ) {
  //   const { id: updatedBy } = req.user;
  //   const updatedReview = await this.reviewsService.update(id, dto, updatedBy);

  //   return {
  //     message: 'update successfully',
  //     updatedReview,
  //   };
  // }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedReview = await this.reviewsService.remove(id, deletedBy);
    return {
      message: 'delete successfully',
      deletedReview,
    };
  }
}
