import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class ReviewFilter extends OmitType(PageOptionsDto, [
  'order',
] as const) {}

export class CreateReviewDto {
  @ApiProperty({ required: false })
  movieId: string | null;

  @ApiProperty({ required: false })
  description: string | null;

  @ApiProperty({ required: false })
  star: number | null;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
