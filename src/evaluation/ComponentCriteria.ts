import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { PartialComponents } from "./PartialComponents";
import { CriterionScores } from "./CriterionScores";

@Index("component_criteria_pkey", ["id"], { unique: true })
@Index("idx_criteria_component", ["partialComponentId"], {})
@Entity("component_criteria", { schema: "public" })
export class ComponentCriteria {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "partial_component_id" })
  partialComponentId: string;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("numeric", { name: "weight", precision: 5, scale: 2 })
  weight: string;

  @Column("integer", { name: "sort_order" })
  sortOrder: number;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(
    () => PartialComponents,
    (partialComponents) => partialComponents.componentCriteria,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "partial_component_id", referencedColumnName: "id" }])
  partialComponent: PartialComponents;

  @OneToMany(
    () => CriterionScores,
    (criterionScores) => criterionScores.componentCriterion
  )
  criterionScores: CriterionScores[];
}
