import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";
import { Students } from "../users/Students";

@Index("justifications_pkey", ["id"], { unique: true })
@Index(
  "idx_justifications_active",
  ["isActive", "justificationDate", "studentId"],
  {}
)
@Index("idx_justifications_student", ["justificationDate", "studentId"], {})
@Entity("justifications", { schema: "public" })
export class Justifications {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("text", { name: "reason" })
  reason: string;

  @Column("date", { name: "justification_date" })
  justificationDate: string;

  @Column("integer", { name: "module_number" })
  moduleNumber: number;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.justifications)
  @JoinColumn([{ name: "registered_by", referencedColumnName: "id" }])
  registeredBy: Users;

  @ManyToOne(() => Students, (students) => students.justifications)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
