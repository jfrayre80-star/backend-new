import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ActivityTeamMembers } from "./ActivityTeamMembers";
import { Activities } from "./Activities";
import { Submissions } from "./Submissions";

@Index("idx_teams_activity", ["activityId"], {})
@Index("activity_teams_pkey", ["id"], { unique: true })
@Entity("activity_teams", { schema: "public" })
export class ActivityTeams {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "activity_id" })
  activityId: string;

  @Column("character varying", { name: "name", nullable: true, length: 100 })
  name: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToMany(
    () => ActivityTeamMembers,
    (activityTeamMembers) => activityTeamMembers.team
  )
  activityTeamMembers: ActivityTeamMembers[];

  @ManyToOne(() => Activities, (activities) => activities.activityTeams, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "activity_id", referencedColumnName: "id" }])
  activity: Activities;

  @OneToMany(() => Submissions, (submissions) => submissions.team)
  submissions: Submissions[];
}
