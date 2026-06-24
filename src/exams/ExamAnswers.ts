import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ExamAttempts } from "./ExamAttempts";
import { ExamQuestions } from "./ExamQuestions";

@Index("exam_answers_attempt_id_question_id_key", ["attemptId", "questionId"], {
  unique: true,
})
@Index("idx_answers_attempt", ["attemptId"], {})
@Index("idx_exam_answers_auto", ["attemptId", "isCorrect"], {})
@Index("exam_answers_pkey", ["id"], { unique: true })
@Entity("exam_answers", { schema: "public" })
export class ExamAnswers {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "attempt_id", unique: true })
  attemptId: string;

  @Column("uuid", { name: "question_id", unique: true })
  questionId: string;

  @Column("character varying", {
    name: "selected_option_label",
    nullable: true,
    length: 10,
  })
  selectedOptionLabel: string | null;

  @Column("text", { name: "answer_text", nullable: true })
  answerText: string | null;

  @Column("boolean", { name: "is_correct", nullable: true })
  isCorrect: boolean | null;

  @Column("numeric", { name: "score", nullable: true, precision: 5, scale: 2 })
  score: string | null;

  @Column("timestamp with time zone", {
    name: "saved_at",
    nullable: true,
    default: () => "now()",
  })
  savedAt: Date | null;

  @ManyToOne(() => ExamAttempts, (examAttempts) => examAttempts.examAnswers, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "attempt_id", referencedColumnName: "id" }])
  attempt: ExamAttempts;

  @ManyToOne(() => ExamQuestions, (examQuestions) => examQuestions.examAnswers)
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question: ExamQuestions;
}
