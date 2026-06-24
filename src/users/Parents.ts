import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Alerts } from "../notifications/Alerts";
import { Users } from "./Users";
import { Students } from "./Students";

@Index("parents_pkey", ["id"], { unique: true })
@Entity("parents", { schema: "public" })
export class Parents {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", {
    name: "phone_secondary",
    nullable: true,
    length: 20,
  })
  phoneSecondary: string | null;

  @Column("character varying", {
    name: "emergency_contact",
    nullable: true,
    length: 255,
  })
  emergencyContact: string | null;

  @Column("character varying", {
    name: "occupation",
    nullable: true,
    length: 100,
  })
  occupation: string | null;

  @OneToMany(() => Alerts, (alerts) => alerts.parent)
  alerts: Alerts[];

  @ManyToOne(() => Users, (users) => users.parents, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Students, (students) => students.parent)
  students: Students[];
}
