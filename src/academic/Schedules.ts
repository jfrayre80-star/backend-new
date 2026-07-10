import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AttendanceRecords } from "../attendance/AttendanceRecords";
import { QrCodes } from "../attendance/QrCodes";
import { Classrooms } from "../classrooms/Classrooms";
import { Groups } from "./Groups";
import { Subjects } from "./Subjects";
import { Teachers } from "../users/Teachers";

@Index("idx_schedules_classroom", ["classroomId", "dayOfWeek"], {})
@Index("idx_schedules_group", ["dayOfWeek", "groupId"], {})
@Index("idx_schedules_teacher", ["dayOfWeek", "teacherId"], {})
@Index("schedules_pkey", ["id"], { unique: true })
@Entity("schedules", { schema: "public" })
export class Schedules {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("uuid", { name: "teacher_id" })
  teacherId: string;

  @Column("uuid", { name: "group_id" })
  groupId: string;

  @Column("uuid", { name: "subject_id" })
  subjectId: string;

  @Column("uuid", { name: "classroom_id", nullable: true })
  classroomId: string | null;

  @Column("character varying", {
    name: "classroom_override",
    nullable: true,
    length: 100,
  })
  classroomOverride: string | null;

  @Column("smallint", { name: "day_of_week" })
  dayOfWeek: number;

  @Column("time without time zone", { name: "start_time" })
  startTime: string;

  @Column("time without time zone", { name: "end_time" })
  endTime: string;

  @Column("character varying", { name: "semester", length: 20 })
  semester: string;

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

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @OneToMany(
    () => AttendanceRecords,
    (attendanceRecords) => attendanceRecords.schedule
  )
  attendanceRecords: AttendanceRecords[];

  @OneToMany(() => QrCodes, (qrCodes) => qrCodes.schedule)
  qrCodes: QrCodes[];

  @ManyToOne(() => Classrooms, (classrooms) => classrooms.schedules, { nullable: true })
  @JoinColumn([{ name: "classroom_id", referencedColumnName: "id" }])
  classroom: Classrooms | null;

  @ManyToOne(() => Groups, (groups) => groups.schedules)
  @JoinColumn([{ name: "group_id", referencedColumnName: "id" }])
  group: Groups;

  @ManyToOne(() => Subjects, (subjects) => subjects.schedules)
  @JoinColumn([{ name: "subject_id", referencedColumnName: "id" }])
  subject: Subjects;

  @ManyToOne(() => Teachers, (teachers) => teachers.schedules)
  @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
  teacher: Teachers;
}
