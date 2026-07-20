import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Groups } from "../academic/Groups";
import { PartialComponents } from "./PartialComponents";
import { Subjects } from "../academic/Subjects";
import { Teachers } from "../users/Teachers";
import { ActivityDeliveries } from "./ActivityDeliveries";
import { ActivityExceptions } from "./ActivityExceptions";
import { ActivityTeams } from "./ActivityTeams";
import { Exams } from "../exams/Exams";

@Index("idx_activities_group", ["groupId"], {})
@Index("activities_pkey", ["id"], { unique: true })
@Index("idx_activities_component", ["partialComponentId"], {})
@Index("idx_activities_teacher", ["teacherId"], {})
@Entity("activities", { schema: "public" })
export class Activities {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "partial_component_id" })
  partialComponentId: string;

  @Column("uuid", { name: "teacher_id" })
  teacherId: string;

  @Column("uuid", { name: "group_id" })
  groupId: string;

  @Column("uuid", { name: "subject_id" })
subjectId: string;

  @Column("character varying", { name: "title", length: 255 })
  title: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "rubric_description", nullable: true })
  rubricDescription: string | null;

  @Column("character varying", {
    name: "activity_type",
    length: 20,
    default: () => "'assignment'",
  })
  activityType: string;

  @Column("numeric", { name: "weight", precision: 5, scale: 2 })
  weight: string;

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

  @Column("timestamp with time zone", { name: "due_date" })
  dueDate: Date;

  @Column("numeric", {
    name: "min_grade",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "0",
  })
  minGrade: string | null;

  @Column("boolean", {
    name: "is_reopened",
    nullable: true,
    default: () => "false",
  })
  isReopened: boolean | null;

  @Column("timestamp with time zone", {
    name: "reopened_until",
    nullable: true,
  })
  reopenedUntil: Date | null;

  @Column("boolean", {
    name: "reopened_for_all",
    nullable: true,
    default: () => "true",
  })
  reopenedForAll: boolean | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["active", "closed", "reopened"],
    default: () => "'active'",
  })
  status: "active" | "closed" | "reopened" | null;

  @Column("boolean", {
    name: "allows_team_submissions",
    nullable: true,
    default: () => "false",
  })
  allowsTeamSubmissions: boolean | null;

  @Column("integer", {
    name: "max_team_size",
    nullable: true,
    default: () => "4",
  })
  maxTeamSize: number | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @ManyToOne(() => Groups, (groups) => groups.activities)
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: Groups;

  @ManyToOne(
    () => PartialComponents,
    (partialComponents) => partialComponents.activities
  )
  @JoinColumn([{ name: "partial_component_id", referencedColumnName: "id" }])
  partialComponent: PartialComponents;

  @ManyToOne(() => Subjects, (subjects) => subjects.activities)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;

  @ManyToOne(() => Teachers, (teachers) => teachers.activities)
  @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
  teacher: Teachers;

  @OneToMany(
    () => ActivityDeliveries,
    (activityDeliveries) => activityDeliveries.activity
  )
  activityDeliveries: ActivityDeliveries[];

  @OneToMany(
    () => ActivityExceptions,
    (activityExceptions) => activityExceptions.activity
  )
  activityExceptions: ActivityExceptions[];

  @OneToMany(() => ActivityTeams, (activityTeams) => activityTeams.activity)
  activityTeams: ActivityTeams[];

  @OneToMany(() => Exams, (exams) => exams.activity)
  exams: Exams[];
}
