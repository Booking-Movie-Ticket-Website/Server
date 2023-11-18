import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theaters } from 'src/entities/Theaters';
import { TheatersController } from './theaters.controller';
import { TheatersService } from 'src/services/theaters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Theaters])],
  controllers: [TheatersController],
  providers: [TheatersService],
})
export class TheatersModule {}
