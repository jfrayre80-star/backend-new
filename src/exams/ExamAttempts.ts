import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ExamAnswers } from "./ExamAnswers";
import { Exams } from "./Exams";
import { Students } from "../users/Students";
import { FocusLossLogs } from "./FocusLossLogs";

@Index(
  "exam_attempts_exam_id_student_id_attempt_number_key",
  ["attemptNumber", "examId", "studentId"],
  { unique: true }
)
@Index("idx_attempts_exam", ["examId"], {})
@Index("exam_attempts_pkey", ["id"], { unique: true })
@Index("idx_attempts_student", ["studentId"], {})
@Entity("exam_attempts", { schema: "public" })
export class ExamAttempts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "exam_id", unique: true })
  examId: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("integer", {
    name: "attempt_number",
    nullable: true,
    unique: true,
    default: () => "1",
  })
  attemptNumber: number | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["in_progress", "pending_review", "graded", "closed"],
    default: () => "'in_progress'",
  })
  status: "in_progress" | "pending_review" | "graded" | "closed" | null;

  @Column("numeric", {
    name: "total_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  totalScore: string | null;

  @Column("numeric", {
    name: "auto_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  autoScore: string | null;

  @Column("numeric", {
    name: "manual_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  manualScore: string | null;

  @Column("integer", {
    name: "focus_loss_count",
    nullable: true,
    default: () => "0",
  })
  focusLossCount: number | null;

  @Column("timestamp with time zone", {
    name: "started_at",
    nullable: true,
    default: () => "now()",
  })
  startedAt: Date | null;

  @Column("timestamp with time zone", { name: "completed_at", nullable: true })
  completedAt: Date | null;

  @Column("boolean", {
    name: "is_auto_graded",
    nullable: true,
    default: () => "false",
  })
  isAutoGraded: boolean | null;

  @OneToMany(() => ExamAnswers, (examAnswers) => examAnswers.attempt)
  examAnswers: ExamAnswers[];

  @ManyToOne(() => Exams, (exams) => exams.examAttempts)
  @JoinColumn([{ name: "exam_id", referencedColumnName: "id" }])
  exam: Exams;

  @ManyToOne(() => Students, (students) => students.examAttempts)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @OneToMany(() => FocusLossLogs, (focusLossLogs) => focusLossLogs.attempt)
  focusLossLogs: FocusLossLogs[];
}
