import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AcademicHistory } from "../semester/AcademicHistory";
import { Activities } from "../evaluation/Activities";
import { DualMonthlySubjects } from "../dual/DualMonthlySubjects";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { Exams } from "../exams/Exams";
import { ExtraordinaryEnrollments } from "./ExtraordinaryEnrollments";
import { PartialGrades } from "../evaluation/PartialGrades";
import { Schedules } from "./Schedules";
import { SemesterGrades } from "../semester/SemesterGrades";
import { Specialties } from "./Specialties";
import { WeeklyLogs } from "../dual/WeeklyLogs";

@Index("subjects_code_key", ["code"], { unique: true })
@Index("subjects_pkey", ["id"], { unique: true })
@Index("idx_subjects_specialty", ["specialtyId"], {})
@Entity("subjects", { schema: "public" })
export class Subjects {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "code", unique: true, length: 20 })
  code: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "image_url", nullable: true })
  imageUrl: string | null;

  @Column("integer", { name: "credits", nullable: true, default: () => "0" })
  credits: number | null;

  @Column("uuid", { name: "specialty_id", nullable: true })
  specialtyId: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @OneToMany(
    () => AcademicHistory,
    (academicHistory) => academicHistory.subject
  )
  academicHistories: AcademicHistory[];

  @OneToMany(() => Activities, (activities) => activities.subject)
  activities: Activities[];

  @OneToMany(
    () => DualMonthlySubjects,
    (dualMonthlySubjects) => dualMonthlySubjects.subject
  )
  dualMonthlySubjects: DualMonthlySubjects[];

  @OneToMany(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.subject
  )
  evaluationSchemes: EvaluationSchemes[];

  @OneToMany(() => Exams, (exams) => exams.subject)
  exams: Exams[];

  @OneToMany(
    () => ExtraordinaryEnrollments,
    (extraordinaryEnrollments) => extraordinaryEnrollments.subject
  )
  extraordinaryEnrollments: ExtraordinaryEnrollments[];

  @OneToMany(() => PartialGrades, (partialGrades) => partialGrades.subject)
  partialGrades: PartialGrades[];

  @OneToMany(() => Schedules, (schedules) => schedules.subject)
  schedules: Schedules[];

  @OneToMany(() => SemesterGrades, (semesterGrades) => semesterGrades.subject)
  semesterGrades: SemesterGrades[];

  @ManyToOne(() => Specialties, (specialties) => specialties.subjects)
  @JoinColumn([{ name: "specialty_id", referencedColumnName: "id" }])
  specialty: Specialties;

  @OneToMany(() => WeeklyLogs, (weeklyLogs) => weeklyLogs.subject)
  weeklyLogs: WeeklyLogs[];
}
