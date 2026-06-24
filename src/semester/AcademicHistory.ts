import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { Semesters } from "../academic/Semesters";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";

@Index("academic_history_pkey", ["id"], { unique: true })
@Index("idx_academic_history_student", ["semesterId", "studentId"], {})
@Index(
  "academic_history_student_id_subject_id_semester_id_key",
  ["semesterId", "studentId", "subjectId"],
  { unique: true }
)
@Entity("academic_history", { schema: "public" })
export class AcademicHistory {
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

  @Column("uuid", { name: "semester_id" })
  semesterId: string;

  @Column("numeric", {
    name: "partials_average",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  partialsAverage: string | null;

  @Column("numeric", {
    name: "semester_exam_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  semesterExamScore: string | null;

  @Column("numeric", {
    name: "final_grade",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  finalGrade: string | null;

  @Column("numeric", {
    name: "extraordinary_grade",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  extraordinaryGrade: string | null;

  @Column("boolean", { name: "is_approved", nullable: true })
  isApproved: boolean | null;

  @Column("timestamp with time zone", {
    name: "completed_at",
    nullable: true,
    default: () => "now()",
  })
  completedAt: Date | null;

  @ManyToOne(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.academicHistories
  )
  @JoinColumn([{ name: "evaluation_scheme_id", referencedColumnName: "id" }])
  evaluationScheme: EvaluationSchemes;

  @ManyToOne(() => Semesters, (semesters) => semesters.academicHistories)
  @JoinColumn([{ name: "semester_id", referencedColumnName: "id" }])
  semester: Semesters;

  @ManyToOne(() => Students, (students) => students.academicHistories)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(() => Subjects, (subjects) => subjects.academicHistories)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;
}
