import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ActivityDeliveries } from "./ActivityDeliveries";
import { Users } from "../users/Users";
import { Students } from "../users/Students";
import { ActivityTeams } from "./ActivityTeams";

@Index("idx_submissions_delivery", ["activityDeliveryId"], {})
@Index(
  "submissions_activity_delivery_id_student_id_key",
  ["activityDeliveryId", "studentId"],
  { unique: true }
)
@Index("idx_submissions_auto", ["grade", "isAutoGraded"], {})
@Index("submissions_pkey", ["id"], { unique: true })
@Index("idx_submissions_local", ["localId"], { unique: true })
@Index("idx_submissions_student", ["studentId"], {})
@Index("idx_submissions_team", ["teamId"], {})
@Entity("submissions", { schema: "public" })
export class Submissions {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "local_id", nullable: true })
  localId: string | null;

  @Column("uuid", { name: "activity_delivery_id" })
  activityDeliveryId: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @Column("uuid", { name: "team_id", nullable: true })
  teamId: string | null;

  @Column("jsonb", { name: "files", nullable: true, default: [] })
  files: object | null;

  @Column("timestamp with time zone", {
    name: "submitted_at",
    nullable: true,
    default: () => "now()",
  })
  submittedAt: Date | null;

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

  @Column("integer", {
    name: "clock_drift_seconds",
    nullable: true,
    default: () => "0",
  })
  clockDriftSeconds: number | null;

  @Column("boolean", {
    name: "is_late",
    nullable: true,
    default: () => "false",
  })
  isLate: boolean | null;

@Column("numeric", {
  name: "grade",
  nullable: true,
  precision: 5,
  scale: 2,
})
grade: string | null;

@Column("text", {
  name: "feedback",
  nullable: true,
})
feedback: string | null;

@Column("uuid", {
  name: "graded_by",
  nullable: true,
})
gradedById: string | null;

@Column("timestamp with time zone", {
  name: "graded_at",
  nullable: true,
})
gradedAt: Date | null;

@Column("boolean", {
  name: "is_auto_graded",
  nullable: true,
  default: () => "false",
})
isAutoGraded: boolean | null;

  @ManyToOne(
    () => ActivityDeliveries,
    (activityDeliveries) => activityDeliveries.submissions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "activity_delivery_id", referencedColumnName: "id" }])
  activityDelivery: ActivityDeliveries;

  @ManyToOne(() => Users, (users) => users.submissions)
  @JoinColumn([{ name: "graded_by", referencedColumnName: "id" }])
  gradedBy: Users;

  @ManyToOne(() => Students, (students) => students.submissions)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(() => ActivityTeams, (activityTeams) => activityTeams.submissions)
  @JoinColumn([{ name: "team_id", referencedColumnName: "id" }])
  team: ActivityTeams;
}
