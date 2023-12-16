import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from 'src/entities/People';
import { PeopleController } from './people.controller';
import { PeopleService } from 'src/services/people.service';
import { CloudinaryService } from 'src/utils/cloudinary';

@Module({
  imports: [TypeOrmModule.forFeature([People])],
  controllers: [PeopleController],
  providers: [PeopleService, CloudinaryService],
})
export class PeopleModule {}
