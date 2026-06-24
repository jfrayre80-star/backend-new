import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Activities } from "../evaluation/Activities";
import { DualEnrollments } from "../dual/DualEnrollments";
import { EvaluationSchemes } from "../evaluation/EvaluationSchemes";
import { Exams } from "../exams/Exams";
import { QrCodes } from "../attendance/QrCodes";
import { Schedules } from "../academic/Schedules";
import { Users } from "./Users";

@Index("teachers_employee_code_key", ["employeeCode"], { unique: true })
@Index("teachers_pkey", ["id"], { unique: true })
@Entity("teachers", { schema: "public" })
export class Teachers {
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
    name: "specialization",
    nullable: true,
    length: 255,
  })
  specialization: string | null;

  @Column("date", { name: "hire_date", nullable: true })
  hireDate: string | null;

  @OneToMany(() => Activities, (activities) => activities.teacher)
  activities: Activities[];

  @OneToMany(
    () => DualEnrollments,
    (dualEnrollments) => dualEnrollments.academicTutor
  )
  dualEnrollments: DualEnrollments[];

  @OneToMany(
    () => EvaluationSchemes,
    (evaluationSchemes) => evaluationSchemes.teacher
  )
  evaluationSchemes: EvaluationSchemes[];

  @OneToMany(() => Exams, (exams) => exams.teacher)
  exams: Exams[];

  @OneToMany(() => QrCodes, (qrCodes) => qrCodes.teacher)
  qrCodes: QrCodes[];

  @OneToMany(() => Schedules, (schedules) => schedules.teacher)
  schedules: Schedules[];

  @ManyToOne(() => Users, (users) => users.teachers, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
