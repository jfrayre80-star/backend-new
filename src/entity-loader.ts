import { Users } from "./users/Users";
import { Teachers } from "./users/Teachers";
import { Admins } from "./users/Admins";
import { Parents } from "./users/Parents";
import { Students } from "./users/Students";
import { Specialties } from "./academic/Specialties";
import { Semesters } from "./academic/Semesters";
import { Subjects } from "./academic/Subjects";
import { Groups } from "./academic/Groups";
import { GroupEnrollments } from "./academic/GroupEnrollments";
import { Schedules } from "./academic/Schedules";
import { ExtraordinaryEnrollments } from "./academic/ExtraordinaryEnrollments";
import { ClassroomTypes } from "./classrooms/ClassroomTypes";
import { Classrooms } from "./classrooms/Classrooms";
import { QrCodes } from "./attendance/QrCodes";
import { AttendanceRecords } from "./attendance/AttendanceRecords";
import { AccessLogs } from "./attendance/AccessLogs";
import { Justifications } from "./attendance/Justifications";
import { SyncQueue } from "./attendance/SyncQueue";
import { OfflineOperations } from "./attendance/OfflineOperations";
import { EvaluationSchemes } from "./evaluation/EvaluationSchemes";
import { PartialConfigs } from "./evaluation/PartialConfigs";
import { PartialComponents } from "./evaluation/PartialComponents";
import { ComponentCriteria } from "./evaluation/ComponentCriteria";
import { Activities } from "./evaluation/Activities";
import { ActivityDeliveries } from "./evaluation/ActivityDeliveries";
import { ActivityExceptions } from "./evaluation/ActivityExceptions";
import { ActivityTeams } from "./evaluation/ActivityTeams";
import { ActivityTeamMembers } from "./evaluation/ActivityTeamMembers";
import { Submissions } from "./evaluation/Submissions";
import { PartialGrades } from "./evaluation/PartialGrades";
import { ComponentScores } from "./evaluation/ComponentScores";
import { CriterionScores } from "./evaluation/CriterionScores";
import { DisciplinaryReports } from "./evaluation/DisciplinaryReports";
import { Exams } from "./exams/Exams";
import { ExamQuestions } from "./exams/ExamQuestions";
import { QuestionContexts } from "./exams/QuestionContexts";
import { ExamAttempts } from "./exams/ExamAttempts";
import { ExamAnswers } from "./exams/ExamAnswers";
import { FocusLossLogs } from "./exams/FocusLossLogs";
import { SemesterConfigs } from "./semester/SemesterConfigs";
import { SemesterGrades } from "./semester/SemesterGrades";
import { AcademicHistory } from "./semester/AcademicHistory";
import { CompanyTutors } from "./dual/CompanyTutors";
import { DualEnrollments } from "./dual/DualEnrollments";
import { DualMonthlySubjects } from "./dual/DualMonthlySubjects";
import { WeeklyLogs } from "./dual/WeeklyLogs";
import { Notices } from "./notifications/Notices";
import { Alerts } from "./notifications/Alerts";
import { NotificationQueue } from "./notifications/NotificationQueue";
import { SystemConfig } from "./infrastructure/SystemConfig";
import { ActiveSessions } from "./infrastructure/ActiveSessions";
import { FormatTemplates } from "./formats/FormatTemplates";

export const allEntities = [
  Users,
  Teachers,
  Admins,
  Parents,
  Students,
  Specialties,
  Semesters,
  Subjects,
  Groups,
  GroupEnrollments,
  Schedules,
  ExtraordinaryEnrollments,
  ClassroomTypes,
  Classrooms,
  QrCodes,
  AttendanceRecords,
  AccessLogs,
  Justifications,
  SyncQueue,
  OfflineOperations,
  EvaluationSchemes,
  PartialConfigs,
  PartialComponents,
  ComponentCriteria,
  Activities,
  ActivityDeliveries,
  ActivityExceptions,
  ActivityTeams,
  ActivityTeamMembers,
  Submissions,
  PartialGrades,
  ComponentScores,
  CriterionScores,
  DisciplinaryReports,
  Exams,
  ExamQuestions,
  QuestionContexts,
  ExamAttempts,
  ExamAnswers,
  FocusLossLogs,
  SemesterConfigs,
  SemesterGrades,
  AcademicHistory,
  CompanyTutors,
  DualEnrollments,
  DualMonthlySubjects,
  WeeklyLogs,
  Notices,
  Alerts,
  NotificationQueue,
  SystemConfig,
  ActiveSessions,
  FormatTemplates,
];
