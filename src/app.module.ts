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
import { SchedulesModule } from './academic/schedules.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExtraordinaryEnrollmentsModule } from './academic/extraordinary-enrollments.module';
import { ActivitiesModule } from './evaluation/activities.module';
import { PartialGradesModule } from './evaluation/partial-grades.module';
import { PartialConfigsModule } from './evaluation/partial-configs.module';
import { PartialComponentsModule } from './evaluation/partial-components.module';
import { EvaluationSchemesModule } from './evaluation/evaluation-schemes.module';
import { ExamsModule } from './exams/exams.module';
import { SemesterModule } from './semester/semester.module';
import { AuthModule } from './auth/auth.module';
import { SystemConfigModule } from './infrastructure/system-config.module';
import { ActiveSessionsModule } from './infrastructure/active-sessions.module';
import { ActivityDeliveriesModule } from './evaluation/activity-deliveries.module';
import { ActivityExceptionsModule } from './evaluation/activity-exceptions.module';
import { ActivityTeamsModule } from './evaluation/activity-teams.module';
import { SubmissionsModule } from './evaluation/submissions.module';
import { DisciplinaryReportsModule } from './evaluation/disciplinary-reports.module';
import { ComponentCriteriaModule } from './evaluation/component-criteria.module';
import { ComponentScoresModule } from './evaluation/component-scores.module';
import { CriterionScoresModule } from './evaluation/criterion-scores.module';
import { CompanyTutorsModule } from './dual/company-tutors.module';
import { DualMonthlySubjectsModule } from './dual/dual-monthly-subjects.module';
import { SyncQueueModule } from './attendance/sync-queue.module';
import { OfflineOperationsModule } from './attendance/offline-operations.module';
import { NoticesModule } from './notifications/notices.module';
import { AlertsModule } from './notifications/alerts.module';

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
    SchedulesModule,
    AttendanceModule,
    ExtraordinaryEnrollmentsModule,
    ActivitiesModule,
    PartialGradesModule,
    PartialConfigsModule,
    PartialComponentsModule,
    EvaluationSchemesModule,
    ExamsModule,
    SemesterModule,
    AuthModule,
    SystemConfigModule,
    ActiveSessionsModule,
    ActivityDeliveriesModule,
    ActivityExceptionsModule,
    ActivityTeamsModule,
    SubmissionsModule,
    DisciplinaryReportsModule,
    ComponentCriteriaModule,
    ComponentScoresModule,
    CriterionScoresModule,
    CompanyTutorsModule,
    DualMonthlySubjectsModule,
    SyncQueueModule,
    OfflineOperationsModule,
    NoticesModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
