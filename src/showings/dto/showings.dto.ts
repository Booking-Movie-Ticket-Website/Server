import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';
import { SeatsEnum } from 'src/shared/seats.enum';

export class ShowingFilter extends OmitType(PageOptionsDto, [
  'order',
] as const) {
  @ApiProperty({ required: false })
  movieId: string | null;

  @ApiProperty({ required: false })
  theaterId: string | null;

  @ApiProperty({ required: false, default: true })
  isAvailable: boolean | null;
}

export class CreateShowingDto {
  @ApiProperty({ required: false })
  movieId: string | null;

  @ApiProperty({ required: false })
  roomId: string | null;

  @ApiProperty({ required: false, format: 'YYYY-MM-DD hh:mm:ss' })
  startTime: Date | null;
}

export class UpdateShowingDto extends PartialType(CreateShowingDto) {}
