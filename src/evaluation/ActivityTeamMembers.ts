import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Students } from "../users/Students";
import { ActivityTeams } from "./ActivityTeams";

@Index("activity_team_members_pkey", ["id"], { unique: true })
@Index(
  "activity_team_members_team_id_student_id_key",
  ["studentId", "teamId"],
  { unique: true }
)
@Index("idx_team_members_team", ["teamId"], {})
@Entity("activity_team_members", { schema: "public" })
export class ActivityTeamMembers {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "team_id" })
  teamId: string;

  @Column("uuid", { name: "student_id" })
  studentId: string;

  @ManyToOne(() => Students, (students) => students.activityTeamMembers)
  @JoinColumn([{ name: "student_id", referencedColumnName: "id" }])
  student: Students;

  @ManyToOne(
    () => ActivityTeams,
    (activityTeams) => activityTeams.activityTeamMembers,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "team_id", referencedColumnName: "id" }])
  team: ActivityTeams;
}
