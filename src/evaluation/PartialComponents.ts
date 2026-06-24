import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Activities } from "./Activities";
import { ComponentCriteria } from "./ComponentCriteria";
import { ComponentScores } from "./ComponentScores";
import { PartialConfigs } from "./PartialConfigs";

@Index("partial_components_pkey", ["id"], { unique: true })
@Index("idx_components_config", ["partialConfigId"], {})
@Entity("partial_components", { schema: "public" })
export class PartialComponents {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "partial_config_id" })
  partialConfigId: string;

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

  @OneToMany(() => Activities, (activities) => activities.partialComponent)
  activities: Activities[];

  @OneToMany(
    () => ComponentCriteria,
    (componentCriteria) => componentCriteria.partialComponent
  )
  componentCriteria: ComponentCriteria[];

  @OneToMany(
    () => ComponentScores,
    (componentScores) => componentScores.partialComponent
  )
  componentScores: ComponentScores[];

  @ManyToOne(
    () => PartialConfigs,
    (partialConfigs) => partialConfigs.partialComponents,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "partial_config_id", referencedColumnName: "id" }])
  partialConfig: PartialConfigs;
}
