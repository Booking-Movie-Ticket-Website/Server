import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class CategoryFilter extends OmitType(PageOptionsDto, [
  'order',
] as const) {
  @ApiProperty({ required: false })
  name: string | null;
}

export class CreateCategoryDto {
  @ApiProperty({ required: false })
  name: string | null;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
