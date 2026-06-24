import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Students } from "../users/Students";

@Index("idx_access_sync", ["deviceTerminalId", "isSynced"], {})
@Index("idx_access_terminal_unsynced", ["deviceTerminalId", "isSynced"], {})
@Index("access_logs_pkey", ["id"], { unique: true })
@Index("idx_access_student", ["scannedAt", "studentId"], {})
@Entity("access_logs", { schema: "public" })
export class AccessLogs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("enum", { name: "event_type", enum: ["entry", "exit"] })
  eventType: "entry" | "exit";

  @Column("timestamp with time zone", { name: "scanned_at" })
  scannedAt: Date;

  @Column("character varying", { name: "device_terminal_id", length: 100 })
  deviceTerminalId: string;

  @Column("boolean", {
    name: "is_synced",
    nullable: true,
    default: () => "true",
  })
  isSynced: boolean | null;

  @Column("boolean", {
    name: "is_exit_return",
    nullable: true,
    default: () => "false",
  })
  isExitReturn: boolean | null;

  @Column("boolean", {
    name: "requires_return",
    nullable: true,
    default: () => "false",
  })
  requiresReturn: boolean | null;

  @Column("timestamp with time zone", { name: "synced_at", nullable: true })
  syncedAt: Date | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Students, (students) => students.accessLogs)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;
}
