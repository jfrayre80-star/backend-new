import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "../users/Users";
import { Groups } from "../academic/Groups";

@Index("notices_pkey", ["id"], { unique: true })
@Index("idx_notices_global", ["isGlobal"], {})
@Index("idx_notices_role", ["targetRole"], {})
@Entity("notices", { schema: "public" })
export class Notices {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "content" })
  content: string;

  @Column("enum", {
    name: "target_role",
    nullable: true,
    enum: ["admin", "teacher", "student", "parent"],
  })
  targetRole: "admin" | "teacher" | "student" | "parent" | null;

  @Column("boolean", {
    name: "is_global",
    nullable: true,
    default: () => "false",
  })
  isGlobal: boolean | null;

  @Column("character varying", {
    name: "priority",
    nullable: true,
    length: 20,
    default: () => "'normal'",
  })
  priority: string | null;

  @Column("timestamp with time zone", {
    name: "published_at",
    nullable: true,
    default: () => "now()",
  })
  publishedAt: Date | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.notices)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Groups, (groups) => groups.notices)
  @JoinColumn([{ name: "target_group_id", referencedColumnName: "id" }])
  targetGroup: Groups;
}
