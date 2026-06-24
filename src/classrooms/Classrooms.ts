import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ClassroomTypes } from "./ClassroomTypes";
import { Groups } from "../academic/Groups";
import { Schedules } from "../academic/Schedules";

@Index("classrooms_code_key", ["code"], { unique: true })
@Index("classrooms_pkey", ["id"], { unique: true })
@Entity("classrooms", { schema: "public" })
export class Classrooms {
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

  @Column("integer", { name: "capacity" })
  capacity: number;

  @Column("character varying", {
    name: "building",
    nullable: true,
    length: 100,
  })
  building: string | null;

  @Column("integer", { name: "floor", nullable: true })
  floor: number | null;

  @Column("boolean", {
    name: "has_equipment",
    nullable: true,
    default: () => "false",
  })
  hasEquipment: boolean | null;

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

  @ManyToOne(
    () => ClassroomTypes,
    (classroomTypes) => classroomTypes.classrooms
  )
  @JoinColumn([{ name: "classroom_type_id", referencedColumnName: "id" }])
  classroomType: ClassroomTypes;

  @OneToMany(() => Groups, (groups) => groups.baseClassroom)
  groups: Groups[];

  @OneToMany(() => Schedules, (schedules) => schedules.classroom)
  schedules: Schedules[];
}
