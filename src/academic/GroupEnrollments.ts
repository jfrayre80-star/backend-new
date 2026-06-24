import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Groups } from "./Groups";
import { Students } from "../users/Students";

@Index("idx_enrollments_group", ["groupId"], {})
@Index("group_enrollments_student_id_group_id_key", ["groupId", "studentId"], {
  unique: true,
})
@Index("group_enrollments_pkey", ["id"], { unique: true })
@Index("idx_enrollments_student", ["studentId"], {})
@Entity("group_enrollments", { schema: "public" })
export class GroupEnrollments {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id", unique: true })
  studentId: string;

  @Column("uuid", { name: "group_id", unique: true })
  groupId: string;

  @Column("timestamp with time zone", {
    name: "enrolled_at",
    nullable: true,
    default: () => "now()",
  })
  enrolledAt: Date | null;

  @ManyToOne(() => Groups, (groups) => groups.groupEnrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: Groups;

  @ManyToOne(() => Students, (students) => students.groupEnrollments, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
