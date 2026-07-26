import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ComponentCriteria } from "./ComponentCriteria";
import { ComponentScores } from "./ComponentScores";

@Index(
  "criterion_scores_component_score_id_component_criterion_id_key",
  ["componentCriterionId", "componentScoreId"],
  { unique: true }
)
@Index("idx_criterion_scores_component", ["componentScoreId"], {})
@Index("criterion_scores_pkey", ["id"], { unique: true })
@Entity("criterion_scores", { schema: "public" })
export class CriterionScores {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "component_score_id" })
  componentScoreId: string;

  @Column("uuid", { name: "component_criterion_id" })
  componentCriterionId: string;

  @Column("numeric", { name: "score", nullable: true, precision: 5, scale: 2 })
  score: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => ComponentCriteria,
    (componentCriteria) => componentCriteria.criterionScores
  )
  @JoinColumn([{ name: "component_criterion_id", referencedColumnName: "id" }])
  componentCriterion: ComponentCriteria;

  @ManyToOne(
    () => ComponentScores,
    (componentScores) => componentScores.criterionScores,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "component_score_id", referencedColumnName: "id" }])
  componentScore: ComponentScores;
}
