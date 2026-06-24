import { Column, Entity, Index, OneToMany } from "typeorm";
import { ActiveSessions } from "../infrastructure/ActiveSessions";
import { ActivityExceptions } from "../evaluation/ActivityExceptions";
import { Admins } from "./Admins";
import { AttendanceRecords } from "../attendance/AttendanceRecords";
import { DisciplinaryReports } from "../evaluation/DisciplinaryReports";
import { Justifications } from "../attendance/Justifications";
import { Notices } from "../notifications/Notices";
import { OfflineOperations } from "../attendance/OfflineOperations";
import { Parents } from "./Parents";
import { Students } from "./Students";
import { Submissions } from "../evaluation/Submissions";
import { Teachers } from "./Teachers";

@Index("users_email_key", ["email"], { unique: true })
@Index("idx_users_email", ["email"], {})
@Index("users_pkey", ["id"], { unique: true })
@Index("idx_users_role", ["role"], {})
@Entity("users", { schema: "public" })
export class Users {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", {
    name: "email",
    nullable: true,
    unique: true,
    length: 255,
  })
  email: string | null;

  @Column("character varying", { name: "password_hash", length: 255 })
  passwordHash: string;

  @Column("character varying", { name: "first_name", length: 100 })
  firstName: string;

  @Column("character varying", { name: "last_name", length: 100 })
  lastName: string;

  @Column("character varying", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("enum", {
    name: "role",
    enum: ["admin", "teacher", "student", "parent"],
  })
  role: "admin" | "teacher" | "student" | "parent";

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("character varying", {
    name: "device_id",
    nullable: true,
    length: 255,
  })
  deviceId: string | null;

  @Column("boolean", {
    name: "must_change_password",
    nullable: true,
    default: () => "true",
  })
  mustChangePassword: boolean | null;

  @Column("timestamp with time zone", { name: "last_login", nullable: true })
  lastLogin: Date | null;

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

  @OneToMany(() => ActiveSessions, (activeSessions) => activeSessions.user)
  activeSessions: ActiveSessions[];

  @OneToMany(
    () => ActivityExceptions,
    (activityExceptions) => activityExceptions.createdBy
  )
  activityExceptions: ActivityExceptions[];

  @OneToMany(() => Admins, (admins) => admins.user)
  admins: Admins[];

  @OneToMany(
    () => AttendanceRecords,
    (attendanceRecords) => attendanceRecords.recordedBy
  )
  attendanceRecords: AttendanceRecords[];

  @OneToMany(
    () => DisciplinaryReports,
    (disciplinaryReports) => disciplinaryReports.reportedBy
  )
  disciplinaryReports: DisciplinaryReports[];

  @OneToMany(
    () => Justifications,
    (justifications) => justifications.registeredBy
  )
  justifications: Justifications[];

  @OneToMany(() => Notices, (notices) => notices.createdBy)
  notices: Notices[];

  @OneToMany(
    () => OfflineOperations,
    (offlineOperations) => offlineOperations.user
  )
  offlineOperations: OfflineOperations[];

  @OneToMany(() => Parents, (parents) => parents.user)
  parents: Parents[];

  @OneToMany(() => Students, (students) => students.user)
  students: Students[];

  @OneToMany(() => Submissions, (submissions) => submissions.gradedBy)
  submissions: Submissions[];

  @OneToMany(() => Teachers, (teachers) => teachers.user)
  teachers: Teachers[];
}
