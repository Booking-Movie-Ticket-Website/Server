import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';
import { SeatsEnum } from 'src/shared/seats.enum';

export class SeatFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  roomId: string | null;

  @ApiProperty({
    required: false,
    enum: SeatsEnum,
    default: SeatsEnum.STANDARD,
  })
  seatType: SeatsEnum | null;
}

export class CreateSeatDto {
  @ApiProperty({ required: false })
  roomId: string | null;

  @ApiProperty({ required: false })
  numberOfRow: number | null;

  @ApiProperty({ required: false })
  numberOfColumn: number | null;
}

export class UpdateSeatDto {
  @ApiProperty({ required: false })
  firstSeatId: string | null;

  @ApiProperty({ required: false })
  secondSeatId: string | null;
}
