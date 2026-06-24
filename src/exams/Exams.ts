import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ExamAttempts } from "./ExamAttempts";
import { ExamQuestions } from "./ExamQuestions";
import { Activities } from "../evaluation/Activities";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { Groups } from "../academic/Groups";
import { Subjects } from "../academic/Subjects";
import { Teachers } from "../users/Teachers";
import { QuestionContexts } from "./QuestionContexts";

@Index("idx_exams_group", ["groupId"], {})
@Index("exams_pkey", ["id"], { unique: true })
@Entity("exams", { schema: "public" })
export class Exams {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "group_id" })
  groupId: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "instructions", nullable: true })
  instructions: string | null;

  @Column("numeric", { name: "weight", precision: 5, scale: 2 })
  weight: string;

  @Column("integer", { name: "time_limit_minutes" })
  timeLimitMinutes: number;

  @Column("enum", {
    name: "exam_type",
    enum: ["multiple_choice", "open_question", "mixed"],
  })
  examType: "multiple_choice" | "open_question" | "mixed";

  @Column("enum", {
    name: "exam_category",
    enum: ["partial", "semestral", "extraordinary"],
    default: () => "'partial'",
  })
  examCategory: "partial" | "semestral" | "extraordinary";

  @Column("integer", {
    name: "max_attempts",
    nullable: true,
    default: () => "1",
  })
  maxAttempts: number | null;

  @Column("boolean", {
    name: "requires_full_screen",
    nullable: true,
    default: () => "true",
  })
  requiresFullScreen: boolean | null;

  @Column("integer", {
    name: "max_focus_losses",
    nullable: true,
    default: () => "3",
  })
  maxFocusLosses: number | null;

  @Column("numeric", {
    name: "passing_grade",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "60",
  })
  passingGrade: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", { name: "published_at", nullable: true })
  publishedAt: Date | null;

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

  @OneToMany(() => ExamAttempts, (examAttempts) => examAttempts.exam)
  examAttempts: ExamAttempts[];

  @OneToMany(() => ExamQuestions, (examQuestions) => examQuestions.exam)
  examQuestions: ExamQuestions[];

  @ManyToOne(() => Activities, (activities) => activities.exams)
  @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
  activity: Activities;

  @ManyToOne(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.exams
  )
  @JoinColumn([{ name: "evaluation_scheme_id", referencedColumnName: "id" }])
  evaluationScheme: EvaluationSchemes;

  @ManyToOne(() => Groups, (groups) => groups.exams)
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: Groups;

  @ManyToOne(() => Subjects, (subjects) => subjects.exams)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;

  @ManyToOne(() => Teachers, (teachers) => teachers.exams)
  @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
  teacher: Teachers;

  @OneToMany(
    () => QuestionContexts,
    (questionContexts) => questionContexts.exam
  )
  questionContexts: QuestionContexts[];
}
