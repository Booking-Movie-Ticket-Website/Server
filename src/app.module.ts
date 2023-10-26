import { Module } from '@nestjs/common';
import { PostgresDbConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { PeopleModule } from './people/people.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresDbConfig,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    AuthModule,
    RolesModule,
    CategoriesModule,
    PeopleModule,
    MoviesModule,
  ],
  controllers: [],
  providers: [PostgresDbConfig],
})
export class AppModule {}
