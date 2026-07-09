import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { allEntities } from './entity-loader';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SpecialtiesModule } from './academic/specialties.module';
import { SemestersModule } from './academic/semesters.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { ClassroomTypesModule } from './classroom-types/classroom-types.module';
import { GroupsModule } from './academic/groups.module';
import { GroupEnrollmentsModule } from './academic/group-enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'CECyTech',
      entities: allEntities,
      synchronize: false,
      logging: ['error', 'warn'],
    }),
    UsersModule,
    SubjectsModule,
    SpecialtiesModule,
    SemestersModule,
    ClassroomsModule,
    ClassroomTypesModule,
    GroupsModule,
    GroupEnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
