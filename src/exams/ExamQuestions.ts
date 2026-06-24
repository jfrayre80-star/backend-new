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
import { QuestionContexts } from "./QuestionContexts";

@Index("idx_exam_questions_exam", ["examId"], {})
@Index("exam_questions_pkey", ["id"], { unique: true })
@Entity("exam_questions", { schema: "public" })
export class ExamQuestions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "exam_id" })
  examId: string;

  @Column("enum", { name: "question_type", enum: ["multiple_choice", "open"] })
  questionType: "multiple_choice" | "open";

  @Column("text", { name: "question_text" })
  questionText: string;

  @Column("numeric", { name: "points", precision: 5, scale: 2 })
  points: string;

  @Column("integer", { name: "sort_order" })
  sortOrder: number;

  @Column("jsonb", { name: "options", nullable: true })
  options: object | null;

  @Column("jsonb", { name: "correct_options", nullable: true })
  correctOptions: object | null;

  @Column("character varying", {
    name: "selection_type",
    nullable: true,
    length: 20,
    default: () => "'single'",
  })
  selectionType: string | null;

  @Column("integer", { name: "max_characters", nullable: true })
  maxCharacters: number | null;

  @Column("text", { name: "image_url", nullable: true })
  imageUrl: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToMany(() => ExamAnswers, (examAnswers) => examAnswers.question)
  examAnswers: ExamAnswers[];

  @ManyToOne(() => Exams, (exams) => exams.examQuestions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "exam_id", referencedColumnName: "id" }])
  exam: Exams;

  @ManyToOne(
    () => QuestionContexts,
    (questionContexts) => questionContexts.examQuestions
  )
  @JoinColumn([{ name: "question_context_id", referencedColumnName: "id" }])
  questionContext: QuestionContexts;
}
