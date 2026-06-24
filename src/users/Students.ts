import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { AcademicHistory } from "../semester/AcademicHistory";
import { AccessLogs } from "../attendance/AccessLogs";
import { ActivityExceptions } from "../evaluation/ActivityExceptions";
import { ActivityTeamMembers } from "../evaluation/ActivityTeamMembers";
import { Alerts } from "../notifications/Alerts";
import { AttendanceRecords } from "../attendance/AttendanceRecords";
import { DisciplinaryReports } from "../evaluation/DisciplinaryReports";
import { DualEnrollments } from "../dual/DualEnrollments";
import { ExamAttempts } from "../exams/ExamAttempts";
import { ExtraordinaryEnrollments } from "../academic/ExtraordinaryEnrollments";
import { GroupEnrollments } from "../academic/GroupEnrollments";
import { Justifications } from "../attendance/Justifications";
import { PartialGrades } from "../evaluation/PartialGrades";
import { SemesterGrades } from "../semester/SemesterGrades";
import { Semesters } from "../academic/Semesters";
import { Parents } from "./Parents";
import { Specialties } from "../academic/Specialties";
import { Users } from "./Users";
import { Submissions } from "../evaluation/Submissions";
import { WeeklyLogs } from "../dual/WeeklyLogs";

@Index("idx_students_semester", ["currentSemesterId"], {})
@Index("students_enrollment_number_key", ["enrollmentNumber"], { unique: true })
@Index("students_pkey", ["id"], { unique: true })
@Index("idx_students_parent", ["parentId"], {})
@Index("idx_students_specialty", ["specialtyId"], {})
@Index("idx_students_user", ["userId"], {})
@Entity("students", { schema: "public" })
export class Students {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "user_id" })
  userId: string;

  @Column("uuid", { name: "parent_id" })
  parentId: string;

  @Column("character varying", {
    name: "enrollment_number",
    unique: true,
    length: 50,
  })
  enrollmentNumber: string;

  @Column("date", { name: "birth_date", nullable: true })
  birthDate: string | null;

  @Column("numeric", {
    name: "admission_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  admissionScore: string | null;

  @Column("uuid", { name: "specialty_id", nullable: true })
  specialtyId: string | null;

  @Column("uuid", { name: "current_semester_id", nullable: true })
  currentSemesterId: string | null;

  @Column("boolean", {
    name: "is_dual",
    nullable: true,
    default: () => "false",
  })
  isDual: boolean | null;

  @Column("date", {
    name: "enrollment_date",
    nullable: true,
    default: () => "CURRENT_DATE",
  })
  enrollmentDate: string | null;

  @OneToMany(
    () => AcademicHistory,
    (academicHistory) => academicHistory.student
  )
  academicHistories: AcademicHistory[];

  @OneToMany(() => AccessLogs, (accessLogs) => accessLogs.student)
  accessLogs: AccessLogs[];

  @OneToMany(
    () => ActivityExceptions,
    (activityExceptions) => activityExceptions.student
  )
  activityExceptions: ActivityExceptions[];

  @OneToMany(
    () => ActivityTeamMembers,
    (activityTeamMembers) => activityTeamMembers.student
  )
  activityTeamMembers: ActivityTeamMembers[];

  @OneToMany(() => Alerts, (alerts) => alerts.student)
  alerts: Alerts[];

  @OneToMany(
    () => AttendanceRecords,
    (attendanceRecords) => attendanceRecords.student
  )
  attendanceRecords: AttendanceRecords[];

  @OneToMany(
    () => DisciplinaryReports,
    (disciplinaryReports) => disciplinaryReports.student
  )
  disciplinaryReports: DisciplinaryReports[];

  @OneToOne(() => DualEnrollments, (dualEnrollments) => dualEnrollments.student)
  dualEnrollments: DualEnrollments;

  @OneToMany(() => ExamAttempts, (examAttempts) => examAttempts.student)
  examAttempts: ExamAttempts[];

  @OneToMany(
    () => ExtraordinaryEnrollments,
    (extraordinaryEnrollments) => extraordinaryEnrollments.student
  )
  extraordinaryEnrollments: ExtraordinaryEnrollments[];

  @OneToMany(
    () => GroupEnrollments,
    (groupEnrollments) => groupEnrollments.student
  )
  groupEnrollments: GroupEnrollments[];

  @OneToMany(() => Justifications, (justifications) => justifications.student)
  justifications: Justifications[];

  @OneToMany(() => PartialGrades, (partialGrades) => partialGrades.student)
  partialGrades: PartialGrades[];

  @OneToMany(() => SemesterGrades, (semesterGrades) => semesterGrades.student)
  semesterGrades: SemesterGrades[];

  @ManyToOne(() => Semesters, (semesters) => semesters.students)
  @JoinColumn([{ name: "current_semester_id", referencedColumnName: "id" }])
  currentSemester: Semesters;

  @ManyToOne(() => Parents, (parents) => parents.students)
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: Parents;

  @ManyToOne(() => Specialties, (specialties) => specialties.students)
  @JoinColumn([{ name: "specialty_id", referencedColumnName: "id" }])
  specialty: Specialties;

  @ManyToOne(() => Users, (users) => users.students, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Submissions, (submissions) => submissions.student)
  submissions: Submissions[];

  @OneToMany(() => WeeklyLogs, (weeklyLogs) => weeklyLogs.student)
  weeklyLogs: WeeklyLogs[];
}
