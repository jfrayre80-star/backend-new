import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Activities } from "./Activities";
import { Submissions } from "./Submissions";

@Index("idx_deliveries_activity", ["activityId"], {})
@Index("activity_deliveries_pkey", ["id"], { unique: true })
@Entity("activity_deliveries", { schema: "public" })
export class ActivityDeliveries {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "activity_id" })
  activityId: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("numeric", { name: "weight", precision: 5, scale: 2 })
  weight: string;

  @Column("timestamp with time zone", { name: "due_date" })
  dueDate: Date;

  @Column("boolean", {
    name: "requires_file",
    nullable: true,
    default: () => "false",
  })
  requiresFile: boolean | null;

  @Column("character varying", {
    name: "file_types_allowed",
    nullable: true,
    length: 255,
  })
  fileTypesAllowed: string | null;

  @Column("integer", {
    name: "max_file_size_mb",
    nullable: true,
    default: () => "10",
  })
  maxFileSizeMb: number | null;

  @Column("integer", { name: "sort_order" })
  sortOrder: number;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Activities, (activities) => activities.activityDeliveries, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
  activity: Activities;

  @OneToMany(() => Submissions, (submissions) => submissions.activityDelivery)
  submissions: Submissions[];
}
