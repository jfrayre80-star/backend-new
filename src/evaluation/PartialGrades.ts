import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ComponentScores } from "./ComponentScores";
import { PartialConfigs } from "./PartialConfigs";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";

@Index("partial_grades_pkey", ["id"], { unique: true })
@Index("idx_partial_study_circle", ["isStudyCircle"], {})
@Index(
  "partial_grades_student_id_partial_config_id_key",
  ["partialConfigId", "studentId"],
  { unique: true }
)
@Index("idx_partial_grades_student", ["studentId"], {})
@Index("idx_partial_student_subject", ["studentId", "subjectId"], {})
@Entity("partial_grades", { schema: "public" })
export class PartialGrades {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("uuid", { name: "subject_id" })
  subjectId: string;

  @Column("uuid", { name: "partial_config_id" })
  partialConfigId: string;

  @Column("numeric", {
    name: "extra_points",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "0",
  })
  extraPoints: string | null;

  @Column("numeric", { name: "total", nullable: true, precision: 5, scale: 2 })
  total: string | null;

  @Column("boolean", {
    name: "is_blocked",
    nullable: true,
    default: () => "false",
  })
  isBlocked: boolean | null;

  @Column("text", { name: "blocked_reason", nullable: true })
  blockedReason: string | null;

  @Column("boolean", {
    name: "is_study_circle",
    nullable: true,
    default: () => "false",
  })
  isStudyCircle: boolean | null;

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
    () => ComponentScores,
    (componentScores) => componentScores.partialGrade
  )
  componentScores: ComponentScores[];

  @ManyToOne(
    () => PartialConfigs,
    (partialConfigs) => partialConfigs.partialGrades
  )
  @JoinColumn([{ name: "partial_config_id", referencedColumnName: "id" }])
  partialConfig: PartialConfigs;

  @ManyToOne(() => Students, (students) => students.partialGrades)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(() => Subjects, (subjects) => subjects.partialGrades)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;
}
