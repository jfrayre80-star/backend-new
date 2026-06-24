import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ExamQuestions } from "./ExamQuestions";
import { Exams } from "./Exams";

@Index("idx_contexts_exam", ["examId"], {})
@Index("question_contexts_pkey", ["id"], { unique: true })
@Entity("question_contexts", { schema: "public" })
export class QuestionContexts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "exam_id" })
  examId: string;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("text", { name: "content" })
  content: string;

  @Column("text", { name: "image_url", nullable: true })
  imageUrl: string | null;

  @Column("integer", { name: "sort_order" })
  sortOrder: number;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToMany(
    () => ExamQuestions,
    (examQuestions) => examQuestions.questionContext
  )
  examQuestions: ExamQuestions[];

  @ManyToOne(() => Exams, (exams) => exams.questionContexts, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "exam_id", referencedColumnName: "id" }])
  exam: Exams;
}
