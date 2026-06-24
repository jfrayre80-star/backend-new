import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DualEnrollments } from "./DualEnrollments";
import { Subjects } from "../academic/Subjects";

@Index("idx_dual_monthly", ["dualEnrollmentId", "month", "year"], {})
@Index(
  "dual_monthly_subjects_dual_enrollment_id_subject_id_month_y_key",
  ["dualEnrollmentId", "month", "subjectId", "year"],
  { unique: true }
)
@Index("dual_monthly_subjects_pkey", ["id"], { unique: true })
@Entity("dual_monthly_subjects", { schema: "public" })
export class DualMonthlySubjects {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "dual_enrollment_id", unique: true })
  dualEnrollmentId: string;

  @Column("uuid", { name: "subject_id", unique: true })
  subjectId: string;

  @Column("integer", { name: "month", unique: true })
  month: number;

  @Column("integer", { name: "year", unique: true })
  year: number;

  @Column("boolean", { name: "is_tronco_comun", default: () => "true" })
  isTroncoComun: boolean;

  @ManyToOne(
    () => DualEnrollments,
    (dualEnrollments) => dualEnrollments.dualMonthlySubjects,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "dual_enrollment_id", referencedColumnName: "id" }])
  dualEnrollment: DualEnrollments;

  @ManyToOne(() => Subjects, (subjects) => subjects.dualMonthlySubjects)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;
}
