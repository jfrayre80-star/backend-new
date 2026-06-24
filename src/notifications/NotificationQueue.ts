import { Column, Entity, Index } from "typeorm";

@Index("idx_queue_status", ["createdAt", "status"], {})
@Index("notification_queue_pkey", ["id"], { unique: true })
@Index("idx_queue_pending", ["scheduledAt", "status"], {})
@Entity("notification_queue", { schema: "public" })
export class NotificationQueue {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "type", length: 50 })
  type: string;

  @Column("jsonb", { name: "payload" })
  payload: object;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["pending", "processing", "completed", "failed"],
    default: () => "'pending'",
  })
  status: "pending" | "processing" | "completed" | "failed" | null;

  @Column("integer", {
    name: "retry_count",
    nullable: true,
    default: () => "0",
  })
  retryCount: number | null;

  @Column("integer", {
    name: "max_retries",
    nullable: true,
    default: () => "3",
  })
  maxRetries: number | null;

  @Column("text", { name: "error_message", nullable: true })
  errorMessage: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", { name: "processed_at", nullable: true })
  processedAt: Date | null;

  @Column("timestamp with time zone", {
    name: "scheduled_at",
    nullable: true,
    default: () => "now()",
  })
  scheduledAt: Date | null;
}
