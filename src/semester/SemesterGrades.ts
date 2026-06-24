import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { SemesterConfigs } from "./SemesterConfigs";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";

@Index("semester_grades_pkey", ["id"], { unique: true })
@Index(
  "semester_grades_student_id_semester_config_id_key",
  ["semesterConfigId", "studentId"],
  { unique: true }
)
@Index("idx_semester_grades_student", ["studentId", "subjectId"], {})
@Entity("semester_grades", { schema: "public" })
export class SemesterGrades {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("uuid", { name: "subject_id" })
  subjectId: string;

  @Column("uuid", { name: "semester_config_id", unique: true })
  semesterConfigId: string;

  @Column("numeric", {
    name: "exam_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  examScore: string | null;

  @Column("numeric", {
    name: "project_score",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  projectScore: string | null;

  @Column("numeric", { name: "total", nullable: true, precision: 5, scale: 2 })
  total: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => SemesterConfigs,
    (semesterConfigs) => semesterConfigs.semesterGrades
  )
  @JoinColumn([{ name: "semester_config_id", referencedColumnName: "id" }])
  semesterConfig: SemesterConfigs;

  @ManyToOne(() => Students, (students) => students.semesterGrades)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(() => Subjects, (subjects) => subjects.semesterGrades)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;
}
