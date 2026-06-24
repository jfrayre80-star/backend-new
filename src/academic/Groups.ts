import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Activities } from "../evaluation/Activities";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { Exams } from "../exams/Exams";
import { ExtraordinaryEnrollments } from "./ExtraordinaryEnrollments";
import { GroupEnrollments } from "./GroupEnrollments";
import { Classrooms } from "../classrooms/Classrooms";
import { Semesters } from "./Semesters";
import { Specialties } from "./Specialties";
import { Notices } from "../notifications/Notices";
import { Schedules } from "./Schedules";

@Index("groups_code_key", ["code"], { unique: true })
@Index("groups_pkey", ["id"], { unique: true })
@Index("idx_groups_semester", ["semesterId"], {})
@Index("idx_groups_specialty", ["specialtyId"], {})
@Entity("groups", { schema: "public" })
export class Groups {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("character varying", { name: "code", unique: true, length: 20 })
  code: string;

  @Column("character varying", { name: "academic_period", length: 50 })
  academicPeriod: string;

  @Column("character varying", {
    name: "grade_level",
    nullable: true,
    length: 50,
  })
  gradeLevel: string | null;

  @Column("uuid", { name: "specialty_id", nullable: true })
  specialtyId: string | null;

  @Column("uuid", { name: "semester_id", nullable: true })
  semesterId: string | null;

  @Column("boolean", {
    name: "is_dual",
    nullable: true,
    default: () => "false",
  })
  isDual: boolean | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToMany(() => Activities, (activities) => activities.group)
  activities: Activities[];

  @OneToMany(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.group
  )
  evaluationSchemes: EvaluationSchemes[];

  @OneToMany(() => Exams, (exams) => exams.group)
  exams: Exams[];

  @OneToMany(
    () => ExtraordinaryEnrollments,
    (extraordinaryEnrollments) => extraordinaryEnrollments.group
  )
  extraordinaryEnrollments: ExtraordinaryEnrollments[];

  @OneToMany(
    () => GroupEnrollments,
    (groupEnrollments) => groupEnrollments.group
  )
  groupEnrollments: GroupEnrollments[];

  @ManyToOne(() => Classrooms, (classrooms) => classrooms.groups)
  @JoinColumn([{ name: "base_classroom_id", referencedColumnName: "id" }])
  baseClassroom: Classrooms;

  @ManyToOne(() => Semesters, (semesters) => semesters.groups)
  @JoinColumn([{ name: "semester_id", referencedColumnName: "id" }])
  semester: Semesters;

  @ManyToOne(() => Specialties, (specialties) => specialties.groups)
  @JoinColumn([{ name: "specialty_id", referencedColumnName: "id" }])
  specialty: Specialties;

  @OneToMany(() => Notices, (notices) => notices.targetGroup)
  notices: Notices[];

  @OneToMany(() => Schedules, (schedules) => schedules.group)
  schedules: Schedules[];
}
