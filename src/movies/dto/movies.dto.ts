import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import * as moment from 'moment';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class MovieFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  nation: string | null;
}

export class CreateMovieDto {
  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  duration: number | null;

  @ApiProperty({ required: false })
  description: string | null;

  @ApiProperty({ required: false })
  trailerLink: string | null;

  @ApiProperty({
    required: false,
    default: moment(new Date()).format('YYYY-MM-DD'),
  })
  releaseDate: Date | null;

  @ApiProperty({ required: false })
  nation: string | null;

  @ApiProperty({ required: false, default: 0 })
  totalReviews: number | null;

  @ApiProperty({ required: false, default: 0 })
  avrStars: number | null;

  @ApiProperty({ required: false, default: false })
  isActive: boolean | null;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
