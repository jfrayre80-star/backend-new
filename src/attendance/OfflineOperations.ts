import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";

@Index("idx_offline_pending", ["createdAt", "status"], {})
@Index("idx_offline_entity", ["entityType", "localId"], {})
@Index("offline_operations_pkey", ["id"], { unique: true })
@Entity("offline_operations", { schema: "public" })
export class OfflineOperations {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "local_id" })
  localId: string;

  @Column("character varying", { name: "entity_type", length: 100 })
  entityType: string;

  @Column("character varying", { name: "operation_type", length: 10 })
  operationType: string;

  @Column("jsonb", { name: "payload" })
  payload: object;

  @Column("timestamp with time zone", { name: "local_timestamp" })
  localTimestamp: Date;

  @Column("timestamp with time zone", { name: "synced_at", nullable: true })
  syncedAt: Date | null;

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

  @Column("character varying", {
    name: "device_id",
    nullable: true,
    length: 255,
  })
  deviceId: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.offlineOperations)
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
