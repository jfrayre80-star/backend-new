import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { SemesterGrades } from "./SemesterGrades";

@Index("semester_configs_evaluation_scheme_id_key", ["evaluationSchemeId"], {
  unique: true,
})
@Index("semester_configs_pkey", ["id"], { unique: true })
@Entity("semester_configs", { schema: "public" })
export class SemesterConfigs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "evaluation_scheme_id", unique: true })
  evaluationSchemeId: string;

  @Column("character varying", { name: "evaluation_type", length: 20 })
  evaluationType: string;

  @Column("numeric", {
    name: "exam_weight",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "100",
  })
  examWeight: string | null;

  @Column("numeric", {
    name: "project_weight",
    nullable: true,
    precision: 5,
    scale: 2,
    default: () => "0",
  })
  projectWeight: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToOne(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.semesterConfigs,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "evaluation_scheme_id", referencedColumnName: "id" }])
  evaluationScheme: EvaluationSchemes;

  @OneToMany(
    () => SemesterGrades,
    (semesterGrades) => semesterGrades.semesterConfig
  )
  semesterGrades: SemesterGrades[];
}
