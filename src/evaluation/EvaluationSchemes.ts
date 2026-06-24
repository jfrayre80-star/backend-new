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
import { Groups } from "../academic/Groups";
import { Subjects } from "../academic/Subjects";
import { Teachers } from "../users/Teachers";
import { Exams } from "../exams/Exams";
import { PartialConfigs } from "./PartialConfigs";
import { SemesterConfigs } from "../semester/SemesterConfigs";

@Index(
  "evaluation_schemes_subject_id_teacher_id_group_id_key",
  ["groupId", "subjectId", "teacherId"],
  { unique: true }
)
@Index("evaluation_schemes_pkey", ["id"], { unique: true })
@Entity("evaluation_schemes", { schema: "public" })
export class EvaluationSchemes {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "subject_id", unique: true })
  subjectId: string;

  @Column("uuid", { name: "teacher_id", unique: true })
  teacherId: string;

  @Column("uuid", { name: "group_id", unique: true })
  groupId: string;

  @Column("numeric", {
    name: "partials_weight",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "80",
  })
  partialsWeight: string | null;

  @Column("numeric", {
    name: "semester_weight",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "20",
  })
  semesterWeight: string | null;

  @Column("numeric", {
    name: "attendance_minimum_percent",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "60",
  })
  attendanceMinimumPercent: string | null;

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
    (academicHistory) => academicHistory.evaluationScheme
  )
  academicHistories: AcademicHistory[];

  @ManyToOne(() => Groups, (groups) => groups.evaluationSchemes)
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: Groups;

  @ManyToOne(() => Subjects, (subjects) => subjects.evaluationSchemes)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;

  @ManyToOne(() => Teachers, (teachers) => teachers.evaluationSchemes)
  @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
  teacher: Teachers;

  @OneToMany(() => Exams, (exams) => exams.evaluationScheme)
  exams: Exams[];

  @OneToMany(
    () => PartialConfigs,
    (partialConfigs) => partialConfigs.evaluationScheme
  )
  partialConfigs: PartialConfigs[];

  @OneToOne(
    () => SemesterConfigs,
    (semesterConfigs) => semesterConfigs.evaluationScheme
  )
  semesterConfigs: SemesterConfigs;
}
