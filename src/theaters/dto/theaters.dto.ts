import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class TheaterFilter extends OmitType(PageOptionsDto, [
  'order',
] as const) {
  @ApiProperty({ required: false })
  movieId: string | null;

  @ApiProperty({ required: false, format: 'YYYY-MM-DD' })
  showingDate: Date | null;
}

export class CreateTheaterDto {
  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  city: string | null;

  @ApiProperty({ required: false })
  address: string | null;
}

export class UpdateTheaterDto extends PartialType(CreateTheaterDto) {}
