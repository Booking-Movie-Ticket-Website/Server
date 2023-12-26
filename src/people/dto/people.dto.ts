import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class PeopleFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  name: string | null;
}

export class CreatePersonDto {
  @ApiProperty({ required: false })
  fullName: string | null;

  @ApiProperty({ required: false })
  gender: string | null;

  @ApiProperty({ required: false })
  base64ProfilePicture: string | null;

  @ApiProperty({ required: false })
  dateOfBirth: string | null;

  @ApiProperty({ required: false })
  biography: string | null;

  @ApiProperty({ required: false })
  nationality: string | null;
}

export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
