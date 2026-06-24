import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";
import { Students } from "../users/Students";

@Index("disciplinary_reports_pkey", ["id"], { unique: true })
@Index("idx_disciplinary_student", ["studentId"], {})
@Entity("disciplinary_reports", { schema: "public" })
export class DisciplinaryReports {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("enum", {
    name: "severity",
    enum: ["low", "medium", "high", "critical"],
    default: () => "'low'",
  })
  severity: "low" | "medium" | "high" | "critical";

  @Column("text", { name: "description" })
  description: string;

  @Column("text", { name: "action_taken", nullable: true })
  actionTaken: string | null;

  @Column("boolean", {
    name: "is_notified_parent",
    nullable: true,
    default: () => "false",
  })
  isNotifiedParent: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.disciplinaryReports)
  @JoinColumn([{ name: "reported_by", referencedColumnName: "id" }])
  reportedBy: Users;

  @ManyToOne(() => Students, (students) => students.disciplinaryReports)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
