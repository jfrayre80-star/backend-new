import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ExamAttemptsService } from './exam-attempts.service';
import { ExamAttempts } from './ExamAttempts';
import { Exams } from './Exams';
import { Students } from '../users/Students';
import { Schedules } from '../academic/Schedules';
import { AttendanceRecords } from '../attendance/AttendanceRecords';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';

describe('ExamAttemptsService', () => {
  let service: ExamAttemptsService;

  const attemptsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn(async (attempt) => ({ ...attempt, id: 'attempt-1' })),
    remove: jest.fn(),
  };
  const examsRepository = {
    findOne: jest.fn(),
  };
  const studentsRepository = {
    findOne: jest.fn(),
  };
  const schedulesRepository = {
    find: jest.fn(),
  };
  const attendanceRecordsRepository = {
    find: jest.fn(),
  };
  const evaluationSchemesRepository = {
    findOne: jest.fn(),
  };

  const mockExam: Exams = {
    id: '11111111-1111-1111-1111-111111111111',
    groupId: '22222222-2222-2222-2222-222222222222',
    subjectId: '33333333-3333-3333-3333-333333333333',
    teacherId: '44444444-4444-4444-4444-444444444444',
    activityId: null,
    evaluationSchemeId: null,
    title: 'Examen parcial de Matemáticas',
    description: null,
    instructions: null,
    weight: '20',
    timeLimitMinutes: 50,
    examType: 'multiple_choice',
    examCategory: 'partial',
    maxAttempts: 1,
    requiresFullScreen: true,
    maxFocusLosses: 3,
    passingGrade: '60',
    isActive: true,
    publishedAt: null,
    createdAt: null,
    updatedAt: null,
    examAttempts: [],
    examQuestions: [],
    activity: null as any,
    evaluationScheme: null as any,
    group: null as any,
    subject: null as any,
    teacher: null as any,
    questionContexts: [],
  };

  const mockSchedule = {
    id: '55555555-5555-5555-5555-555555555555',
    subjectId: '33333333-3333-3333-3333-333333333333',
  };

  const createAttendanceRecord = (
    status: 'present' | 'late' | 'absent' | 'justified_absence',
  ) => ({
    id: '00000000-0000-0000-0000-000000000001',
    studentId: '77777777-7777-7777-7777-777777777777',
    scheduleId: mockSchedule.id,
    status,
    recordedDate: '2026-01-12',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamAttemptsService,
        { provide: getRepositoryToken(ExamAttempts), useValue: attemptsRepository },
        { provide: getRepositoryToken(Exams), useValue: examsRepository },
        { provide: getRepositoryToken(Students), useValue: studentsRepository },
        { provide: getRepositoryToken(Schedules), useValue: schedulesRepository },
        { provide: getRepositoryToken(AttendanceRecords), useValue: attendanceRecordsRepository },
        { provide: getRepositoryToken(EvaluationSchemes), useValue: evaluationSchemesRepository },
      ],
    }).compile();

    service = module.get<ExamAttemptsService>(ExamAttemptsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('RF-25: filtro de restricción del derecho a examen', () => {
    const dto = {
      examId: mockExam.id,
      studentId: '77777777-7777-7777-7777-777777777777',
      attemptNumber: 1,
    };

    beforeEach(() => {
      examsRepository.findOne.mockResolvedValue(mockExam);
      studentsRepository.findOne.mockResolvedValue({ id: dto.studentId });
      attemptsRepository.count.mockResolvedValue(0);
    });

    it('debe rechazar el intento si la asistencia es menor a 60%', async () => {
      schedulesRepository.find.mockResolvedValue([mockSchedule]);
      // 3 clases: 1 present + 2 absent → 33.33% de asistencia.
      attendanceRecordsRepository.find.mockResolvedValue([
        createAttendanceRecord('present'),
        createAttendanceRecord('absent'),
        createAttendanceRecord('absent'),
      ]);

      await expect(service.create(dto as any)).rejects.toThrow(ForbiddenException);
    });

    it('debe permitir el intento si la asistencia es al menos 60%', async () => {
      schedulesRepository.find.mockResolvedValue([mockSchedule]);
      // 5 clases: 3 present + 2 late → 100% de asistencia.
      attendanceRecordsRepository.find.mockResolvedValue([
        createAttendanceRecord('present'),
        createAttendanceRecord('present'),
        createAttendanceRecord('present'),
        createAttendanceRecord('late'),
        createAttendanceRecord('late'),
      ]);

      const result = await service.create(dto as any);

      expect(result.status).toBe('in_progress');
      expect(attemptsRepository.create).toHaveBeenCalled();
    });

    it('debe ignorar las faltas justificadas en el cálculo', async () => {
      schedulesRepository.find.mockResolvedValue([mockSchedule]);
      // 4 clases: 3 present + 1 justified → 100% de asistencia efectiva.
      attendanceRecordsRepository.find.mockResolvedValue([
        createAttendanceRecord('present'),
        createAttendanceRecord('present'),
        createAttendanceRecord('present'),
        createAttendanceRecord('justified_absence'),
      ]);

      const result = await service.create(dto as any);

      expect(result.status).toBe('in_progress');
    });

    it('debe permitir el intento si la materia no tiene horarios registrados', async () => {
      schedulesRepository.find.mockResolvedValue([]);

      const result = await service.create(dto as any);

      expect(result.status).toBe('in_progress');
    });

    it('debe lanzar NotFound si el examen no existe', async () => {
      examsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('debe usar el umbral del esquema de evaluación (RF-25)', async () => {
      schedulesRepository.find.mockResolvedValue([mockSchedule]);
      // 10 clases: 7 present + 3 absent → 70% de asistencia.
      attendanceRecordsRepository.find.mockResolvedValue([
        ...Array.from({ length: 7 }, () => createAttendanceRecord('present')),
        ...Array.from({ length: 3 }, () => createAttendanceRecord('absent')),
      ]);
      // Esquema configurado con umbral 80% → 70% no alcanza y se rechaza.
      evaluationSchemesRepository.findOne.mockResolvedValue({
        id: '99999999-9999-9999-9999-999999999999',
        attendanceMinimumPercent: '80',
      });
      examsRepository.findOne.mockResolvedValue({
        ...mockExam,
        evaluationSchemeId: '99999999-9999-9999-9999-999999999999',
      });

      await expect(service.create(dto as any)).rejects.toThrow(ForbiddenException);
    });
  });
});
