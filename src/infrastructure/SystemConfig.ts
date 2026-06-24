import { Column, Entity, Index } from "typeorm";

@Index("system_config_pkey", ["id"], { unique: true })
@Index("system_config_key_key", ["key"], { unique: true })
@Entity("system_config", { schema: "public" })
export class SystemConfig {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "key", unique: true, length: 100 })
  key: string;

  @Column("text", { name: "value" })
  value: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;
}
