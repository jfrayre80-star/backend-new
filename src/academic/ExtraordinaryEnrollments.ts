import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Groups } from './Groups';
import { Semesters } from './Semesters';
import { Students } from '../users/Students';
import { Subjects } from './Subjects';

@Index('extraordinary_enrollments_pkey', ['id'], { unique: true })
@Index('idx_extraordinary_student_subject', ['studentId', 'subjectId'], {})
@Index('idx_extraordinary_student', ['studentId'], {})
@Entity('extraordinary_enrollments', { schema: 'public' })
export class ExtraordinaryEnrollments {
  @Column('uuid', {
    primary: true,
    name: 'id',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('uuid', { name: 'student_id' })
  studentId: string;

  @Column('uuid', { name: 'subject_id' })
  subjectId: string;

  @Column('uuid', { name: 'group_id' })
  groupId: string;

  @Column('uuid', { name: 'semester_id' })
  semesterId: string;

  @Column('enum', {
    name: 'type',
    enum: ['regular', 'recovery', 'intersemester'],
  })
  type: 'regular' | 'recovery' | 'intersemester';

  @Column('numeric', {
    name: 'final_grade',
    nullable: true,
    precision: 5,
    scale: 2,
  })
  finalGrade: string | null;

  @Column('boolean', {
    name: 'is_approved',
    nullable: true,
    default: () => 'false',
  })
  isApproved: boolean | null;

  @Column('timestamp with time zone', {
    name: 'enrolled_at',
    nullable: true,
    default: () => 'now()',
  })
  enrolledAt: Date | null;

  @ManyToOne(() => Groups, (groups) => groups.extraordinaryEnrollments)
  @JoinColumn([{ name: 'group_id', referencedColumnName: 'id' }])
  group: Groups;

  @ManyToOne(() => Semesters, (semesters) => semesters.extraordinaryEnrollments)
  @JoinColumn([{ name: 'semester_id', referencedColumnName: 'id' }])
  semester: Semesters;

  @ManyToOne(() => Students, (students) => students.extraordinaryEnrollments)
  @JoinColumn([{ name: 'student_id', referencedColumnName: 'id' }])
  student: Students;

  @ManyToOne(() => Subjects, (subjects) => subjects.extraordinaryEnrollments)
  @JoinColumn([{ name: 'subject_id', referencedColumnName: 'id' }])
  subject: Subjects;
}
