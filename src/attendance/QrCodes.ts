import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Schedules } from "../academic/Schedules";
import { Teachers } from "../users/Teachers";

@Index("idx_qr_expires", ["expiresAt"], {})
@Index("idx_qr_hash", ["hashValue"], {})
@Index("qr_codes_pkey", ["id"], { unique: true })
@Entity("qr_codes", { schema: "public" })
export class QrCodes {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "gen_random_uuid()",
  })
  id: string;

  @Column("character varying", { name: "hash_value", length: 512 })
  hashValue: string;

  @Column("text", { name: "encrypted_metadata", nullable: true })
  encryptedMetadata: string | null;

  @Column("timestamp with time zone", { name: "expires_at" })
  expiresAt: Date;

  @Column("boolean", {
    name: "is_used",
    nullable: true,
    default: () => "false",
  })
  isUsed: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @ManyToOne(() => Schedules, (schedules) => schedules.qrCodes)
  @JoinColumn([{ name: "schedule_id", referencedColumnName: "id" }])
  schedule: Schedules;

  @ManyToOne(() => Teachers, (teachers) => teachers.qrCodes)
  @JoinColumn([{ name: "teacher_id", referencedColumnName: "id" }])
  teacher: Teachers;
}
