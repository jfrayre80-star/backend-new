import { Column, Entity, Index } from "typeorm";

@Index("idx_sync_pending", ["createdAt", "status"], {})
@Index("sync_queue_pkey", ["id"], { unique: true })
@Entity("sync_queue", { schema: "public" })
export class SyncQueue {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "entity_type", length: 50 })
  entityType: string;

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

  @Column("character varying", {
    name: "device_terminal_id",
    nullable: true,
    length: 100,
  })
  deviceTerminalId: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", { name: "processed_at", nullable: true })
  processedAt: Date | null;
}
