import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityTeams } from './ActivityTeams';
import { ActivityTeamMembers } from './ActivityTeamMembers';
import { Activities } from './Activities';
import { Students } from '../users/Students';

import { CreateActivityTeamDto } from './dto/create-activity-team.dto';
import { UpdateActivityTeamDto } from './dto/update-activity-team.dto';

@Injectable()
export class ActivityTeamsService {
  constructor(
    @InjectRepository(ActivityTeams)
    private readonly activityTeamsRepository: Repository<ActivityTeams>,

    @InjectRepository(ActivityTeamMembers)
    private readonly activityTeamMembersRepository: Repository<ActivityTeamMembers>,

    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,

    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
  ) {}

  private async validateActivity(
  activityId: string,
): Promise<Activities> {
  const activity = await this.activitiesRepository.findOne({
    where: { id: activityId },
  });

  if (!activity) {
    throw new NotFoundException(
      `Activity con id ${activityId} no encontrada`,
    );
  }

  if (!activity.allowsTeamSubmissions) {
    throw new BadRequestException(
      'Esta actividad no permite entregas por equipos',
    );
  }

  return activity;
}

private async validateStudent(
  studentId: string,
): Promise<Students> {
  const student = await this.studentsRepository.findOne({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException(
      `Student con id ${studentId} no encontrado`,
    );
  }

  return student;
}

private async validateStudents(
  studentIds: string[],
): Promise<Students[]> {
  const students: Students[] = [];

  for (const studentId of studentIds) {
    const student = await this.validateStudent(studentId);
    students.push(student);
  }

  return students;
}

private validateDuplicateStudents(
  studentIds: string[],
): void {
  const unique = new Set(studentIds);

  if (unique.size !== studentIds.length) {
    throw new ConflictException(
      'Un estudiante no puede aparecer dos veces en el mismo equipo',
    );
  }
}

private validateMaxTeamSize(
  activity: Activities,
  members: number,
): void {
  if (
    activity.maxTeamSize &&
    members > activity.maxTeamSize
  ) {
    throw new BadRequestException(
      `El máximo permitido es de ${activity.maxTeamSize} integrantes`,
    );
  }
}

private async validateDuplicateTeamName(
  activityId: string,
  name?: string,
  excludeId?: string,
) {
  if (!name) return;

  const team = await this.activityTeamsRepository.findOne({
    where: {
      activityId,
      name,
    },
  });

  if (
    team &&
    (!excludeId || team.id !== excludeId)
  ) {
    throw new ConflictException(
      `Ya existe un equipo llamado "${name}" en esta actividad`,
    );
  }
}

async create(
  createActivityTeamDto: CreateActivityTeamDto,
) {
  const {
    activityId,
    name,
    members,
  } = createActivityTeamDto;

  const activity = await this.validateActivity(activityId);

  const studentIds = members.map(
    (member) => member.studentId,
  );

  this.validateDuplicateStudents(studentIds);

  await this.validateDuplicateTeamName(
    activityId,
    name,
  );

  this.validateMaxTeamSize(
    activity,
    members.length,
  );

  const students = await this.validateStudents(
    studentIds,
  );

  const team = this.activityTeamsRepository.create({
    activityId,
    name,
  });

  const savedTeam =
    await this.activityTeamsRepository.save(team);

  const teamMembers = students.map((student) =>
    this.activityTeamMembersRepository.create({
      teamId: savedTeam.id,
      studentId: student.id,
    }),
  );

  await this.activityTeamMembersRepository.save(
    teamMembers,
  );

  return await this.findOne(savedTeam.id);
}

async findAll() {
  return await this.activityTeamsRepository.find({
    relations: {
      activity: true,
      activityTeamMembers: {
        student: true,
      },
      submissions: true,
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

async findOne(id: string) {
  const team =
    await this.activityTeamsRepository.findOne({
      where: { id },
      relations: {
        activity: true,
        activityTeamMembers: {
          student: true,
        },
        submissions: true,
      },
    });

  if (!team) {
    throw new NotFoundException(
      `Activity Team con id ${id} no encontrado`,
    );
  }

  return team;
}

async update(
  id: string,
  updateActivityTeamDto: UpdateActivityTeamDto,
) {
  const team = await this.findOne(id);

  const activityId =
    updateActivityTeamDto.activityId ??
    team.activityId;

  const activity = await this.validateActivity(activityId);

  const name =
    updateActivityTeamDto.name ??
    team.name;

  await this.validateDuplicateTeamName(
    activityId,
    name ?? undefined,
    id,
  );

  if (updateActivityTeamDto.members) {
    const studentIds =
      updateActivityTeamDto.members.map(
        (member) => member.studentId,
      );

    this.validateDuplicateStudents(studentIds);

    this.validateMaxTeamSize(
      activity,
      studentIds.length,
    );

    const students =
      await this.validateStudents(studentIds);

    await this.activityTeamMembersRepository.delete({
      teamId: id,
    });

    const newMembers = students.map((student) =>
      this.activityTeamMembersRepository.create({
        teamId: id,
        studentId: student.id,
      }),
    );

    await this.activityTeamMembersRepository.save(
      newMembers,
    );
  }

  Object.assign(team, {
    activityId,
    name,
  });

  await this.activityTeamsRepository.save(team);

  return await this.findOne(id);
}

async remove(id: string) {
  const team = await this.findOne(id);

  await this.activityTeamsRepository.remove(team);

  return {
    message: 'Activity Team eliminado correctamente',
  };
}
  }