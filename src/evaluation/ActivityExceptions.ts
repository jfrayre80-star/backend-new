import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Activities } from "./Activities";
import { Users } from "../users/Users";
import { Students } from "../users/Students";

@Index("idx_activity_exceptions_activity", ["activityId"], {})
@Index(
  "activity_exceptions_activity_id_student_id_key",
  ["activityId", "studentId"],
  { unique: true }
)
@Index("activity_exceptions_pkey", ["id"], { unique: true })
@Entity("activity_exceptions", { schema: "public" })
export class ActivityExceptions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "activity_id" })
  activityId: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("timestamp with time zone", { name: "reopened_until" })
  reopenedUntil: Date;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Activities, (activities) => activities.activityExceptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
  activity: Activities;

  @ManyToOne(() => Users, (users) => users.activityExceptions)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Students, (students) => students.activityExceptions)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
