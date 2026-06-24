import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Teachers } from "../users/Teachers";
import { CompanyTutors } from "./CompanyTutors";
import { Students } from "../users/Students";
import { DualMonthlySubjects } from "./DualMonthlySubjects";

@Index("idx_dual_academic", ["academicTutorId"], {})
@Index("idx_dual_company", ["companyTutorId"], {})
@Index("dual_enrollments_pkey", ["id"], { unique: true })
@Index("dual_enrollments_student_id_key", ["studentId"], { unique: true })
@Entity("dual_enrollments", { schema: "public" })
export class DualEnrollments {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("uuid", { name: "company_tutor_id" })
  companyTutorId: string;

  @Column("uuid", { name: "academic_tutor_id" })
  academicTutorId: string;

  @Column("date", { name: "start_date" })
  startDate: string;

  @Column("date", { name: "end_date", nullable: true })
  endDate: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @ManyToOne(() => Teachers, (teachers) => teachers.dualEnrollments)
  @JoinColumn([{ name: "academic_tutor_id", referencedColumnName: "id" }])
  academicTutor: Teachers;

  @ManyToOne(
    () => CompanyTutors,
    (companyTutors) => companyTutors.dualEnrollments
  )
  @JoinColumn([{ name: "company_tutor_id", referencedColumnName: "id" }])
  companyTutor: CompanyTutors;

  @OneToOne(() => Students, (students) => students.dualEnrollments)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @OneToMany(
    () => DualMonthlySubjects,
    (dualMonthlySubjects) => dualMonthlySubjects.dualEnrollment
  )
  dualMonthlySubjects: DualMonthlySubjects[];
}
