import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exams } from './Exams';
import { ExamQuestions } from './ExamQuestions';
import { ExamAttempts } from './ExamAttempts';
import { ExamAnswers } from './ExamAnswers';
import { FocusLossLogs } from './FocusLossLogs';
import { QuestionContexts } from './QuestionContexts';
import { Groups } from '../academic/Groups';
import { Subjects } from '../academic/Subjects';
import { Teachers } from '../users/Teachers';
import { Students } from '../users/Students';
import { Schedules } from '../academic/Schedules';
import { AttendanceRecords } from '../attendance/AttendanceRecords';
import { Activities } from '../evaluation/Activities';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';
import { ExamsService } from './exams.service';
import { ExamQuestionsService } from './exam-questions.service';
import { ExamAttemptsService } from './exam-attempts.service';
import { ExamAnswersService } from './exam-answers.service';
import { FocusLossLogsService } from './focus-loss-logs.service';
import { QuestionContextsService } from './question-contexts.service';
import { ExamsController } from './exams.controller';
import { ExamQuestionsController } from './exam-questions.controller';
import { ExamAttemptsController } from './exam-attempts.controller';
import { ExamAnswersController } from './exam-answers.controller';
import { FocusLossLogsController } from './focus-loss-logs.controller';
import { QuestionContextsController } from './question-contexts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exams,
      ExamQuestions,
      ExamAttempts,
      ExamAnswers,
      FocusLossLogs,
      QuestionContexts,
      Groups,
      Subjects,
      Teachers,
      Students,
      Schedules,
      AttendanceRecords,
      Activities,
      EvaluationSchemes,
    ]),
  ],
  controllers: [
    ExamsController,
    ExamQuestionsController,
    ExamAttemptsController,
    ExamAnswersController,
    FocusLossLogsController,
    QuestionContextsController,
  ],
  providers: [
    ExamsService,
    ExamQuestionsService,
    ExamAttemptsService,
    ExamAnswersService,
    FocusLossLogsService,
    QuestionContextsService,
  ],
  exports: [ExamsService],
})
export class ExamsModule {}
