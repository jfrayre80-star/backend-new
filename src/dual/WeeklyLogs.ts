import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";

@Index("weekly_logs_pkey", ["id"], { unique: true })
@Index("idx_weekly_student_year", ["studentId", "year"], {})
@Index(
  "weekly_logs_student_id_week_number_year_subject_id_key",
  ["studentId", "subjectId", "weekNumber", "year"],
  { unique: true }
)
@Index("idx_weekly_student", ["studentId"], {})
@Entity("weekly_logs", { schema: "public" })
export class WeeklyLogs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("uuid", { name: "subject_id", nullable: true, unique: true })
  subjectId: string | null;

  @Column("integer", { name: "week_number", unique: true })
  weekNumber: number;

  @Column("integer", { name: "year", unique: true })
  year: number;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("text", { name: "description" })
  description: string;

  @Column("text", { name: "file_url", nullable: true })
  fileUrl: string | null;

  @Column("text", { name: "company_feedback", nullable: true })
  companyFeedback: string | null;

  @Column("text", { name: "academic_feedback", nullable: true })
  academicFeedback: string | null;

  @Column("numeric", {
    name: "company_grade",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  companyGrade: string | null;

  @Column("numeric", {
    name: "academic_grade",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  academicGrade: string | null;

  @Column("timestamp with time zone", {
    name: "submitted_at",
    nullable: true,
    default: () => "now()",
  })
  submittedAt: Date | null;

  @Column("jsonb", { name: "metadata", nullable: true, default: {} })
  metadata: object | null;

  @ManyToOne(() => Students, (students) => students.weeklyLogs)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(() => Subjects, (subjects) => subjects.weeklyLogs)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;
}
