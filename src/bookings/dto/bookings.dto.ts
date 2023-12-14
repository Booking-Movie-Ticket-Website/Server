import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';
import { StatusesEnum } from 'src/shared/statuses.enum';

export class BookingFilter extends OmitType(PageOptionsDto, [
  'order',
] as const) {
  @ApiProperty({ required: false })
  userId: string | null;
}

export class CreateBookingDto {
  @ApiProperty({ required: false })
  showingId: string | null;

  @ApiProperty({ required: false })
  seatIds: string[] | null;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty({ required: false, enum: StatusesEnum })
  status: StatusesEnum | null;
}
