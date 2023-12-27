import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from 'src/services/users.service';
import { ChangePasswordDto, UpdateUserDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('my-info')
  async findOne(@Req() req) {
    const { id: userId } = req.user;
    return await this.usersService.findOne(userId);
  }

  @Patch('my-info')
  async update(@Req() req, @Body() dto: UpdateUserDto) {
    const { id: userId } = req.user;
    const data = await this.usersService.update(userId, dto);
    return {
      message: 'update successfully',
      data,
    };
  }

  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const { id: userId } = req.user;
    const data = await this.usersService.changePassword(userId, dto);
    return {
      message: 'change password successfully',
      data,
    };
  }
}
