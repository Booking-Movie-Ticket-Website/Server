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
import { ReviewsModule } from './reviews/reviews.module';
import { NewsModule } from './news/news.module';
import { TheatersModule } from './theaters/theaters.module';
import { RoomsModule } from './rooms/rooms.module';
import { SeatsModule } from './seats/seats.module';
import { ShowingsModule } from './showings/showings.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';

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
    ReviewsModule,
    NewsModule,
    TheatersModule,
    RoomsModule,
    SeatsModule,
    ShowingsModule,
    BookingsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [PostgresDbConfig],
})
export class AppModule {}
