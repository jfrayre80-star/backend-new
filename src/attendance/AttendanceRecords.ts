import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";
import { Schedules } from "../academic/Schedules";
import { Students } from "../users/Students";

@Index("attendance_records_pkey", ["id"], { unique: true })
@Index("idx_attendance_local", ["localId"], { unique: true })
@Index("idx_attendance_date", ["recordedAt"], {})
@Index("idx_attendance_batch", ["recordedAt", "status"], {})
@Index(
  "idx_attendance_unique_daily",
  ["recordedDate", "scheduleId", "studentId"],
  { unique: true }
)
@Index("idx_attendance_schedule", ["scheduleId"], {})
@Index("idx_attendance_student", ["studentId"], {})
@Entity("attendance_records", { schema: "public" })
export class AttendanceRecords {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "local_id", nullable: true })
  localId: string | null;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("uuid", { name: "schedule_id" })
  scheduleId: string;

  @Column("enum", {
    name: "status",
    enum: ["present", "late", "absent", "justified_absence"],
    default: () => "'absent'",
  })
  status: "present" | "late" | "absent" | "justified_absence";

  @Column("character varying", { name: "qr_hash", nullable: true, length: 512 })
  qrHash: string | null;

  @Column("timestamp with time zone", {
    name: "scan_timestamp",
    nullable: true,
  })
  scanTimestamp: Date | null;

  @Column("timestamp with time zone", {
    name: "local_timestamp",
    nullable: true,
  })
  localTimestamp: Date | null;

  @Column("boolean", {
    name: "is_offline",
    nullable: true,
    default: () => "false",
  })
  isOffline: boolean | null;

  @Column("boolean", {
    name: "is_auto_closed",
    nullable: true,
    default: () => "false",
  })
  isAutoClosed: boolean | null;

  @Column("timestamp with time zone", {
    name: "recorded_at",
    nullable: true,
    default: () => "now()",
  })
  recordedAt: Date | null;

  @Column("date", { name: "recorded_date", default: () => "CURRENT_DATE" })
  recordedDate: string;

  @Column("jsonb", { name: "audit_trail", nullable: true })
  auditTrail: object | null;

  @Column("uuid", { name: "recorded_by", nullable: true })
  recordedById: string | null;

  @ManyToOne(() => Users, (users) => users.attendanceRecords)
  @JoinColumn([{ name: "recorded_by", referencedColumnName: "id" }])
  recordedBy: Users;

  @ManyToOne(() => Schedules, (schedules) => schedules.attendanceRecords)
  @JoinColumn([{ name: "schedule_id", referencedColumnName: "id" }])
  schedule: Schedules;

  @ManyToOne(() => Students, (students) => students.attendanceRecords)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

}
