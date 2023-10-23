import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, RoleFilter, UpdateRoleDto } from './dto/roles.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateRoleDto) {
    const { id: createdBy } = req.user;
    const newRole = await this.rolesService.create(dto, createdBy);
    return {
      message: 'new role created successfully',
      newRole,
    };
  }

  @Get()
  async findAll(@Query() input: RoleFilter) {
    return await this.rolesService.findAll(input);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const { id: updatedBy } = req.user;
    const updatedRole = await this.rolesService.update(id, dto, updatedBy);

    return {
      message: 'role updated successfully',
      updatedRole,
    };
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    const { id: deletedBy } = req.user;
    const deletedRole = await this.rolesService.remove(id, deletedBy);
    return {
      message: 'role deleted successfully',
      deletedRole,
    };
  }
}
