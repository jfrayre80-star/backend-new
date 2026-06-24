import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Parents } from "../users/Parents";
import { Students } from "../users/Students";

@Index("idx_alerts_unread", ["createdAt", "isRead"], {})
@Index("alerts_pkey", ["id"], { unique: true })
@Index("idx_alerts_parent", ["isRead", "parentId"], {})
@Index("idx_alerts_student", ["isRead", "studentId"], {})
@Entity("alerts", { schema: "public" })
export class Alerts {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("uuid", { name: "parent_id" })
  parentId: string;

  @Column("character varying", { name: "alert_type", length: 50 })
  alertType: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "message" })
  message: string;

  @Column("boolean", {
    name: "is_read",
    nullable: true,
    default: () => "false",
  })
  isRead: boolean | null;

  @Column("timestamp with time zone", { name: "read_at", nullable: true })
  readAt: Date | null;

  @Column("jsonb", { name: "metadata", nullable: true })
  metadata: object | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Parents, (parents) => parents.alerts)
  @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
  parent: Parents;

  @ManyToOne(() => Students, (students) => students.alerts)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
