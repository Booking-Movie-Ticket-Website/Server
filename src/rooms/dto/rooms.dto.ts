import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class RoomFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  theaterId: string | null;
}

export class CreateRoomDto {
  @ApiProperty({ required: false })
  theaterId: string | null;

  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false })
  capacity: number | null;

  @ApiProperty({ required: false })
  type: string | null;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
