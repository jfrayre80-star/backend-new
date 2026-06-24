import { Column, Entity, Index, OneToMany } from "typeorm";
import { Classrooms } from "./Classrooms";

@Index("classroom_types_code_key", ["code"], { unique: true })
@Index("classroom_types_pkey", ["id"], { unique: true })
@Entity("classroom_types", { schema: "public" })
export class ClassroomTypes {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "code", unique: true, length: 50 })
  code: string;

  @Column("character varying", { name: "name", length: 100 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @OneToMany(() => Classrooms, (classrooms) => classrooms.classroomType)
  classrooms: Classrooms[];
}
