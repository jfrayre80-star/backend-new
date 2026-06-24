import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";

@Index("active_sessions_user_id_device_id_key", ["deviceId", "userId"], {
  unique: true,
})
@Index("active_sessions_pkey", ["id"], { unique: true })
@Index("idx_sessions_user", ["isActive", "userId"], {})
@Entity("active_sessions", { schema: "public" })
export class ActiveSessions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "user_id", unique: true })
  userId: string;

  @Column("character varying", { name: "device_id", unique: true, length: 255 })
  deviceId: string;

  @Column("character varying", { name: "token_hash", length: 255 })
  tokenHash: string;

  @Column("inet", { name: "ip_address", nullable: true })
  ipAddress: string | null;

  @Column("text", { name: "user_agent", nullable: true })
  userAgent: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", { name: "expires_at" })
  expiresAt: Date;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.activeSessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
