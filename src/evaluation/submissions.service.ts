import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Submissions } from './Submissions';
import { Activities } from './Activities';
import { ActivityDeliveries } from './ActivityDeliveries';
import { ActivityTeams } from './ActivityTeams';
import { ActivityTeamMembers } from './ActivityTeamMembers';
import { Students } from '../users/Students';
import { Users } from '../users/Users';
import { GroupEnrollments } from '../academic/GroupEnrollments';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submissions)
    private readonly submissionsRepository: Repository<Submissions>,

    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,

    @InjectRepository(ActivityDeliveries)
    private readonly activityDeliveriesRepository: Repository<ActivityDeliveries>,

    @InjectRepository(ActivityTeams)
    private readonly activityTeamsRepository: Repository<ActivityTeams>,

    @InjectRepository(ActivityTeamMembers)
    private readonly activityTeamMembersRepository: Repository<ActivityTeamMembers>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(GroupEnrollments)
    private readonly groupEnrollmentsRepository: Repository<GroupEnrollments>,
  ) {}

  private async validateActivityDelivery(
    activityDeliveryId: string,
  ): Promise<ActivityDeliveries> {
    const activityDelivery =
      await this.activityDeliveriesRepository.findOne({
        where: { id: activityDeliveryId },
        relations: {
          activity: true,
        },
      });

    if (!activityDelivery) {
      throw new NotFoundException(
        `No se encontró la entrega de actividad con id ${activityDeliveryId}`,
      );
    }

    return activityDelivery;
  }

  private async validateStudent(
    studentId: string,
  ): Promise<Students> {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(
        `No se encontró el estudiante con id ${studentId}`,
      );
    }

    return student;
  }

  private async validateDuplicateSubmission(
    activityDeliveryId: string,
    studentId: string,
    submissionId?: string,
  ): Promise<void> {
    const existingSubmission =
      await this.submissionsRepository.findOne({
        where: {
          activityDeliveryId,
          studentId,
        },
      });

    if (
      existingSubmission &&
      existingSubmission.id !== submissionId
    ) {
      throw new ConflictException(
        'El estudiante ya realizó una entrega para esta actividad',
      );
    }
  }

  private async validateLocalId(
    localId?: string,
    submissionId?: string,
  ): Promise<void> {
    if (!localId) {
      return;
    }

    const existingSubmission =
      await this.submissionsRepository.findOne({
        where: { localId },
      });

    if (
      existingSubmission &&
      existingSubmission.id !== submissionId
    ) {
      throw new ConflictException(
        'Ya existe una entrega con el mismo localId',
      );
    }
  }

  private async validateTeam(
    teamId: string,
    studentId: string,
    activityDelivery: ActivityDeliveries,
  ): Promise<ActivityTeams> {
    const team = await this.activityTeamsRepository.findOne({
      where: { id: teamId },
      relations: {
        activity: true,
        activityTeamMembers: true,
      },
    });

    if (!team) {
      throw new NotFoundException(
        `No se encontró el equipo con id ${teamId}`,
      );
    }

    const deliveryActivityId = activityDelivery.activity?.id;
    const teamActivityId = team.activity?.id;

    if (
      deliveryActivityId &&
      teamActivityId &&
      deliveryActivityId !== teamActivityId
    ) {
      throw new BadRequestException(
        'El equipo no pertenece a la actividad de esta entrega',
      );
    }

    const member =
      await this.activityTeamMembersRepository.findOne({
        where: {
          teamId,
          studentId,
        },
      });

    if (!member) {
      throw new BadRequestException(
        'El estudiante no pertenece al equipo indicado',
      );
    }

    return team;
  }

  private calculateIsLate(
    submittedAt: Date,
    dueDate?: Date | string | null,
  ): boolean {
    if (!dueDate) {
      return false;
    }

    return submittedAt.getTime() > new Date(dueDate).getTime();
  }

  private validateGradeValue(grade: string): void {
    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0 ||
      numericGrade > 100
    ) {
      throw new BadRequestException(
        'La calificación debe estar entre 0 y 100',
      );
    }
  }

  async create(
    createSubmissionDto: CreateSubmissionDto,
  ): Promise<Submissions> {
    const {
      activityDeliveryId,
      studentId,
      teamId,
      submittedAt,
      localTimestamp,
      ...submissionData
    } = createSubmissionDto;

    const activityDelivery =
      await this.validateActivityDelivery(activityDeliveryId);

    await this.validateStudent(studentId);

    await this.validateDuplicateSubmission(
      activityDeliveryId,
      studentId,
    );

    await this.validateLocalId(createSubmissionDto.localId);

    if (teamId) {
      await this.validateTeam(
        teamId,
        studentId,
        activityDelivery,
      );
    }

    const submissionDate = submittedAt
      ? new Date(submittedAt)
      : new Date();

    const submission = this.submissionsRepository.create({
      ...submissionData,
      activityDeliveryId,
      studentId,
      teamId: teamId ?? null,
      submittedAt: submissionDate,
      localTimestamp: localTimestamp
        ? new Date(localTimestamp)
        : null,
      isLate: this.calculateIsLate(
        submissionDate,
        activityDelivery.dueDate,
      ),
    });

    const savedSubmission =
      await this.submissionsRepository.save(submission);

    return this.findOne(savedSubmission.id);
  }

  async findAll(): Promise<Submissions[]> {
    return this.submissionsRepository.find({
      relations: {
        activityDelivery: {
          activity: true,
        },
        student: {
          user: true,
        },
        team: true,
        gradedBy: true,
      },
      order: {
        submittedAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Submissions> {
    const submission =
      await this.submissionsRepository.findOne({
        where: { id },
        relations: {
          activityDelivery: {
            activity: true,
          },
          student: {
            user: true,
          },
          team: {
            activityTeamMembers: {
              student: {
                user: true,
              },
            },
          },
          gradedBy: true,
        },
      });

    if (!submission) {
      throw new NotFoundException(
        `No se encontró la entrega con id ${id}`,
      );
    }

    return submission;
  }

  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
  ): Promise<Submissions> {
    const submission = await this.findOne(id);

    const activityDeliveryId =
      updateSubmissionDto.activityDeliveryId ??
      submission.activityDeliveryId;

    const studentId =
      updateSubmissionDto.studentId ??
      submission.studentId;

    const teamId =
      updateSubmissionDto.teamId !== undefined
        ? updateSubmissionDto.teamId
        : submission.teamId;

    const activityDelivery =
      await this.validateActivityDelivery(activityDeliveryId);

    await this.validateStudent(studentId);

    await this.validateDuplicateSubmission(
      activityDeliveryId,
      studentId,
      id,
    );

    await this.validateLocalId(
      updateSubmissionDto.localId,
      id,
    );

    if (teamId) {
      await this.validateTeam(
        teamId,
        studentId,
        activityDelivery,
      );
    }

    const submittedAt = updateSubmissionDto.submittedAt
      ? new Date(updateSubmissionDto.submittedAt)
      : submission.submittedAt ?? new Date();

    const updatedSubmission =
      this.submissionsRepository.merge(submission, {
        ...updateSubmissionDto,
        activityDeliveryId,
        studentId,
        teamId: teamId ?? null,
        submittedAt,
        localTimestamp:
          updateSubmissionDto.localTimestamp !== undefined
            ? new Date(updateSubmissionDto.localTimestamp)
            : submission.localTimestamp,
        isLate: this.calculateIsLate(
          submittedAt,
          activityDelivery.dueDate,
        ),
      });

    await this.submissionsRepository.save(
      updatedSubmission,
    );

    return this.findOne(id);
  }

  async grade(
    id: string,
    gradeSubmissionDto: GradeSubmissionDto,
  ): Promise<Submissions> {
    const submission = await this.findOne(id);

    this.validateGradeValue(gradeSubmissionDto.grade);

    const grader = await this.usersRepository.findOne({
      where: { id: gradeSubmissionDto.gradedById },
    });

    if (!grader) {
      throw new NotFoundException(
        `No se encontró el usuario calificador con id ${gradeSubmissionDto.gradedById}`,
      );
    }

    submission.grade = gradeSubmissionDto.grade;
    submission.feedback =
      gradeSubmissionDto.feedback ?? null;
    submission.gradedById =
      gradeSubmissionDto.gradedById;
    submission.gradedAt = new Date();
    submission.isAutoGraded =
      gradeSubmissionDto.isAutoGraded ?? false;

    await this.submissionsRepository.save(submission);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{
    message: string;
  }> {
    const submission = await this.findOne(id);

    await this.submissionsRepository.remove(submission);

    return {
      message: 'Submission eliminada correctamente',
    };
  }

  /**
   * RF-28 — Motor de Calificación por Omisión.
   * Cuando una actividad vence (due_date en el pasado) y sigue activa, asigna
   * automáticamente la calificación mínima (min_grade) a cada alumno del grupo
   * que no realizó la entrega en la sub-entrega correspondiente, y cierra la
   * actividad. El trigger de BD solo actualiza entregas existentes; este cron
   * cubre también a los alumnos que nunca entregaron. Corre cada hora.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async applyDefaultGrades(): Promise<number> {
    const expired = await this.activitiesRepository.find({
      where: { status: 'active' },
      relations: { activityDeliveries: true },
    });

    const now = new Date();
    let assigned = 0;

    for (const activity of expired) {
      if (activity.dueDate.getTime() > now.getTime()) {
        continue;
      }

      // Solo se aplica a actividades con sub-entregas.
      if (activity.activityDeliveries.length === 0) {
        activity.status = 'closed';
        await this.activitiesRepository.save(activity);
        continue;
      }

      // Alumnos inscritos al grupo de la actividad.
      const enrollments = await this.groupEnrollmentsRepository.find({
        where: { groupId: activity.groupId },
      });
      const studentIds = enrollments.map((e) => e.studentId);

      const minGrade = activity.minGrade ?? '0';

      for (const delivery of activity.activityDeliveries) {
        const existing = await this.submissionsRepository.find({
          where: { activityDeliveryId: delivery.id },
        });
        const deliveredStudentIds = new Set(existing.map((s) => s.studentId));

        for (const studentId of studentIds) {
          if (deliveredStudentIds.has(studentId)) {
            continue;
          }

          const submission = this.submissionsRepository.create({
            activityDeliveryId: delivery.id,
            studentId,
            submittedAt: activity.dueDate,
            isLate: true,
            grade: minGrade,
            feedback:
              'Evaluación automática: no se realizó la entrega en el plazo establecido',
            gradedAt: now,
            isAutoGraded: true,
          });
          await this.submissionsRepository.save(submission);
          assigned++;
        }
      }

      activity.status = 'closed';
      await this.activitiesRepository.save(activity);
    }

    return assigned;
  }
}