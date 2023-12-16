import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import * as moment from 'moment';
import { FilterMoviesEnum } from 'src/shared/movies.enum';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class MovieFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  nation: string | null;

  @ApiProperty({ required: false })
  categoryId: string | null;

  @ApiProperty({
    required: false,
    enum: FilterMoviesEnum,
    default: FilterMoviesEnum.NOW_PLAYING,
  })
  filterMovies: FilterMoviesEnum | null;

  @ApiProperty({ required: false, default: false })
  isNoPagination: boolean | null;
}

export class CreateMoviePoster {
  @ApiProperty({ required: false })
  base64: string | null;

  @ApiProperty({ required: false, default: false })
  isThumb: boolean | null;
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

  @ApiProperty({ required: false })
  director: string | null;

  @ApiProperty({ required: false })
  movieCategoryIds: string[] | null;

  @ApiProperty({ required: false })
  movieParticipantIds: string[] | null;

  @ApiProperty({ required: false, type: [CreateMoviePoster] })
  moviePosters: CreateMoviePoster[] | null;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @ApiProperty({ required: false })
  deleteMovieCategoryIds: string[] | null;

  @ApiProperty({ required: false })
  deleteMovieParticipantIds: string[] | null;
}
