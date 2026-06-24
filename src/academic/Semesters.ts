import { Column, Entity, Index, OneToMany } from "typeorm";
import { AcademicHistory } from "../semester/AcademicHistory";
import { ExtraordinaryEnrollments } from "./ExtraordinaryEnrollments";
import { Groups } from "./Groups";
import { Students } from "../users/Students";

@Index("semesters_pkey", ["id"], { unique: true })
@Entity("semesters", { schema: "public" })
export class Semesters {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "name", length: 50 })
  name: string;

  @Column("integer", { name: "level", nullable: true })
  level: number | null;

  @Column("character varying", { name: "academic_period", length: 50 })
  academicPeriod: string;

  @Column("enum", {
    name: "type",
    enum: ["regular", "recovery", "intersemester"],
    default: () => "'regular'",
  })
  type: "regular" | "recovery" | "intersemester";

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

  @OneToMany(
    () => AcademicHistory,
    (academicHistory) => academicHistory.semester
  )
  academicHistories: AcademicHistory[];

  @OneToMany(
    () => ExtraordinaryEnrollments,
    (extraordinaryEnrollments) => extraordinaryEnrollments.semester
  )
  extraordinaryEnrollments: ExtraordinaryEnrollments[];

  @OneToMany(() => Groups, (groups) => groups.semester)
  groups: Groups[];

  @OneToMany(() => Students, (students) => students.currentSemester)
  students: Students[];
}
