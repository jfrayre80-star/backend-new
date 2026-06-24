import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";

@Index("admins_employee_code_key", ["employeeCode"], { unique: true })
@Index("admins_pkey", ["id"], { unique: true })
@Entity("admins", { schema: "public" })
export class Admins {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", {
    name: "employee_code",
    unique: true,
    length: 50,
  })
  employeeCode: string;

  @Column("character varying", {
    name: "department",
    nullable: true,
    length: 100,
  })
  department: string | null;

  @Column("date", { name: "hire_date", nullable: true })
  hireDate: string | null;

  @ManyToOne(() => Users, (users) => users.admins, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
