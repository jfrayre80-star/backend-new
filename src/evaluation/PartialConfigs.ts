import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { PartialComponents } from "./PartialComponents";
import { EvaluationSchemes } from "./EvaluationSchemes";
import { PartialGrades } from "./PartialGrades";

@Index(
  "partial_configs_evaluation_scheme_id_partial_number_key",
  ["evaluationSchemeId", "partialNumber"],
  { unique: true }
)
@Index("idx_partial_configs_scheme", ["evaluationSchemeId"], {})
@Index("partial_configs_pkey", ["id"], { unique: true })
@Entity("partial_configs", { schema: "public" })
export class PartialConfigs {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "evaluation_scheme_id", unique: true })
  evaluationSchemeId: string;

  @Column("integer", { name: "partial_number", unique: true })
  partialNumber: number;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @OneToMany(
    () => PartialComponents,
    (partialComponents) => partialComponents.partialConfig
  )
  partialComponents: PartialComponents[];

  @ManyToOne(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.partialConfigs,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "evaluation_scheme_id", referencedColumnName: "id" }])
  evaluationScheme: EvaluationSchemes;

  @OneToMany(
    () => PartialGrades,
    (partialGrades) => partialGrades.partialConfig
  )
  partialGrades: PartialGrades[];
}
