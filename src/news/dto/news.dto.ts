import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class NewsFilter extends OmitType(PageOptionsDto, ['order'] as const) {}

export class CreateNewsDto {
  @ApiProperty({ required: false })
  title: string | null;

  @ApiProperty({ required: false })
  shortDesc: string | null;

  @ApiProperty({ required: false })
  fullDesc: string | null;

  @ApiProperty({ required: false })
  newsPictures: string[] | null;
}

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @ApiProperty({ required: false })
  deleteNewsPictureIds: string[] | null;
}
