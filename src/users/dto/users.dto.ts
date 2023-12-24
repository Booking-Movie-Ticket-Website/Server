import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class UserFilter extends OmitType(PageOptionsDto, ['order'] as const) {}
