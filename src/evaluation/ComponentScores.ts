import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { PartialComponents } from "./PartialComponents";
import { PartialGrades } from "./PartialGrades";
import { CriterionScores } from "./CriterionScores";

@Index("component_scores_pkey", ["id"], { unique: true })
@Index(
  "component_scores_partial_grade_id_partial_component_id_key",
  ["partialGradeId", "partialComponentId"],
  { unique: true },
)
@Index("idx_component_scores_grade", ["partialGradeId"], {})
@Entity("component_scores", { schema: "public" })
export class ComponentScores {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "partial_grade_id" })
  partialGradeId: string;

  @Column("uuid", { name: "partial_component_id" })
  partialComponentId: string;

  @Column("numeric", { name: "score", nullable: true, precision: 5, scale: 2 })
  score: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => PartialComponents,
    (partialComponents) => partialComponents.componentScores
  )
  @JoinColumn([{ name: "partial_component_id", referencedColumnName: "id" }])
  partialComponent: PartialComponents;

  @ManyToOne(
    () => PartialGrades,
    (partialGrades) => partialGrades.componentScores,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "partial_grade_id", referencedColumnName: "id" }])
  partialGrade: PartialGrades;

  @OneToMany(
    () => CriterionScores,
    (criterionScores) => criterionScores.componentScore
  )
  criterionScores: CriterionScores[];
}
