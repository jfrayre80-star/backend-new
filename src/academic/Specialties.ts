import { Column, Entity, Index, OneToMany } from "typeorm";
import { Groups } from "./Groups";
import { Students } from "../users/Students";
import { Subjects } from "./Subjects";

@Index("specialties_code_key", ["code"], { unique: true })
@Index("specialties_pkey", ["id"], { unique: true })
@Entity("specialties", { schema: "public" })
export class Specialties {
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

  @Column("text", { name: "description", nullable: true })
  description: string | null;

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

  @OneToMany(() => Groups, (groups) => groups.specialty)
  groups: Groups[];

  @OneToMany(() => Students, (students) => students.specialty)
  students: Students[];

  @OneToMany(() => Subjects, (subjects) => subjects.specialty)
  subjects: Subjects[];
}
