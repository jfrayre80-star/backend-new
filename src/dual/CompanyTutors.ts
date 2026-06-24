import { Column, Entity, Index, OneToMany } from "typeorm";
import { DualEnrollments } from "./DualEnrollments";

@Index("company_tutors_pkey", ["id"], { unique: true })
@Entity("company_tutors", { schema: "public" })
export class CompanyTutors {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "full_name", length: 255 })
  fullName: string;

  @Column("character varying", {
    name: "position",
    nullable: true,
    length: 100,
  })
  position: string | null;

  @Column("character varying", { name: "phone", length: 20 })
  phone: string;

  @Column("character varying", { name: "email", nullable: true, length: 255 })
  email: string | null;

  @Column("character varying", { name: "company_name", length: 255 })
  companyName: string;

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
    () => DualEnrollments,
    (dualEnrollments) => dualEnrollments.companyTutor
  )
  dualEnrollments: DualEnrollments[];
}
