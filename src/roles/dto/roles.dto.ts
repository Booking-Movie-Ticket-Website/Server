import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/shared/pagination/pagination.dto';

export class RoleFilter extends OmitType(PageOptionsDto, ['order'] as const) {
  @ApiProperty({ required: false })
  name: string | null;
}

export class CreateRoleDto {
  @ApiProperty({ required: false })
  name: string | null;

  @ApiProperty({ required: false, default: false })
  isActive: boolean | null;

  @ApiProperty({ required: false, default: false })
  isAccessCms: boolean | null;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
