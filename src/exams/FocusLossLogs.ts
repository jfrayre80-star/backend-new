import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ExamAttempts } from "./ExamAttempts";

@Index("idx_focus_attempt", ["attemptId"], {})
@Index("focus_loss_logs_pkey", ["id"], { unique: true })
@Entity("focus_loss_logs", { schema: "public" })
export class FocusLossLogs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "attempt_id" })
  attemptId: string;

  @Column("character varying", { name: "event_type", length: 50 })
  eventType: string;

  @Column("timestamp with time zone", {
    name: "occurred_at",
    nullable: true,
    default: () => "now()",
  })
  occurredAt: Date | null;

  @Column("jsonb", { name: "browser_info", nullable: true })
  browserInfo: object | null;

  @ManyToOne(() => ExamAttempts, (examAttempts) => examAttempts.focusLossLogs, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "attempt_id", referencedColumnName: "id" }])
  attempt: ExamAttempts;
}
