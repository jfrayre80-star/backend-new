import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";

import { WeeklyLogsService } from "./weekly-logs.service";
import { WeeklyLogs } from "./WeeklyLogs";
import { Students } from "../users/Students";
import { Subjects } from "../academic/Subjects";
import {
  CreateWeeklyLogDto,
  GradeWeeklyLogDto,
} from "./dto/create-weekly-log.dto";

describe("WeeklyLogsService", () => {
  let service: WeeklyLogsService;

  const weeklyLogsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const studentsRepository = {
    findOne: jest.fn(),
  };
  const subjectsRepository = {
    findOne: jest.fn(),
  };

  const STUDENT_ID = "44444444-4444-4444-4444-444444444444";
  const SUBJECT_ID = "33333333-3333-3333-3333-333333333333";
  const LOG_ID = "11111111-1111-1111-1111-111111111111";

  const mockLog: WeeklyLogs = {
    id: LOG_ID,
    studentId: STUDENT_ID,
    subjectId: SUBJECT_ID,
    weekNumber: 3,
    year: 2026,
    title: "Bitácora semana 3",
    description: "Avances de la semana",
    fileUrl: null,
    companyFeedback: null,
    academicFeedback: null,
    companyGrade: null,
    academicGrade: null,
    submittedAt: new Date("2026-02-01T00:00:00Z"),
    metadata: null,
    student: null as any,
    subject: null as any,
  };

  const mockStudent: Partial<Students> = {
    id: STUDENT_ID,
    userId: "77777777-7777-7777-7777-777777777777",
    parentId: "88888888-8888-8888-8888-888888888888",
    enrollmentNumber: "2024-001",
  };

  const mockSubject: Partial<Subjects> = {
    id: SUBJECT_ID,
    code: "MAT-101",
    name: "Matemáticas I",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeklyLogsService,
        {
          provide: getRepositoryToken(WeeklyLogs),
          useValue: weeklyLogsRepository,
        },
        {
          provide: getRepositoryToken(Students),
          useValue: studentsRepository,
        },
        {
          provide: getRepositoryToken(Subjects),
          useValue: subjectsRepository,
        },
      ],
    }).compile();

    service = module.get<WeeklyLogsService>(WeeklyLogsService);
  });

  it("debe estar definido", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("debe listar las bitácoras con sus relaciones ordenadas por año/semana", async () => {
      weeklyLogsRepository.find.mockResolvedValue([mockLog]);

      const result = await service.findAll();

      expect(weeklyLogsRepository.find).toHaveBeenCalledWith({
        relations: { student: { user: true }, subject: true },
        order: { year: "DESC", weekNumber: "DESC" },
      });
      expect(result).toEqual([mockLog]);
    });
  });

  describe("findOne", () => {
    it("debe retornar la bitácora si existe", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(mockLog);

      const result = await service.findOne(LOG_ID);

      expect(weeklyLogsRepository.findOne).toHaveBeenCalledWith({
        where: { id: LOG_ID },
        relations: { student: { user: true }, subject: true },
      });
      expect(result).toEqual(mockLog);
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("no-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByStudent", () => {
    it("debe listar las bitácoras del alumno", async () => {
      weeklyLogsRepository.find.mockResolvedValue([mockLog]);

      const result = await service.findByStudent(STUDENT_ID);

      expect(weeklyLogsRepository.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_ID },
        relations: { subject: true },
        order: { year: "DESC", weekNumber: "DESC" },
      });
      expect(result).toEqual([mockLog]);
    });

    it("debe filtrar por materia cuando se envía subjectId", async () => {
      weeklyLogsRepository.find.mockResolvedValue([mockLog]);

      await service.findByStudent(STUDENT_ID, SUBJECT_ID);

      expect(weeklyLogsRepository.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_ID, subjectId: SUBJECT_ID },
        relations: { subject: true },
        order: { year: "DESC", weekNumber: "DESC" },
      });
    });
  });

  describe("create", () => {
    const dto: CreateWeeklyLogDto = {
      studentId: STUDENT_ID,
      subjectId: SUBJECT_ID,
      weekNumber: 3,
      year: 2026,
      title: "Bitácora semana 3",
      description: "Avances de la semana",
    };

    it("debe crear la bitácora cuando todo es válido", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      subjectsRepository.findOne.mockResolvedValue(mockSubject);
      weeklyLogsRepository.findOne.mockResolvedValue(null);
      weeklyLogsRepository.create.mockReturnValue(mockLog);
      weeklyLogsRepository.save.mockResolvedValue(mockLog);

      const result = await service.create(dto);

      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.studentId },
      });
      expect(subjectsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.subjectId },
      });
      expect(weeklyLogsRepository.create).toHaveBeenCalledWith({
        ...dto,
        submittedAt: expect.any(Date),
      });
      expect(weeklyLogsRepository.save).toHaveBeenCalledWith(mockLog);
      expect(result).toEqual(mockLog);
    });

    it("debe rechazar si el alumno no existe", async () => {
      studentsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(subjectsRepository.findOne).not.toHaveBeenCalled();
    });

    it("debe rechazar si la materia no existe", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      subjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it("debe rechazar bitácoras duplicadas (mismo alumno/materia/semana/año)", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      subjectsRepository.findOne.mockResolvedValue(mockSubject);
      weeklyLogsRepository.findOne.mockResolvedValue(mockLog);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it("debe usar IsNull para subjectId cuando no se envía materia", async () => {
      const dtoSinMateria: CreateWeeklyLogDto = {
        ...dto,
        subjectId: undefined,
      };
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      weeklyLogsRepository.findOne.mockResolvedValue(null);
      weeklyLogsRepository.create.mockReturnValue(mockLog);
      weeklyLogsRepository.save.mockResolvedValue(mockLog);

      await service.create(dtoSinMateria);

      expect(weeklyLogsRepository.findOne).toHaveBeenCalledWith({
        where: {
          studentId: STUDENT_ID,
          subjectId: expect.anything(),
          weekNumber: 3,
          year: 2026,
        },
      });
    });
  });

  describe("update", () => {
    it("debe actualizar una bitácora existente", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(mockLog);
      weeklyLogsRepository.findOne.mockResolvedValueOnce(mockLog); // findOne(id)
      weeklyLogsRepository.findOne.mockResolvedValueOnce(null); // duplicado
      weeklyLogsRepository.save.mockResolvedValue({
        ...mockLog,
        title: "Título actualizado",
      });

      const result = await service.update(LOG_ID, {
        title: "Título actualizado",
      });

      expect(weeklyLogsRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(null);

      await expect(service.update("no-existe", { title: "x" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("grade", () => {
    it("debe calificar la bitácora y guardar la calificación", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(mockLog);
      weeklyLogsRepository.save.mockResolvedValue({
        ...mockLog,
        companyGrade: "8.5",
        companyFeedback: "Buen trabajo",
      });

      const dto: GradeWeeklyLogDto = {
        companyGrade: "8.5",
        companyFeedback: "Buen trabajo",
      };
      const result = await service.grade(LOG_ID, dto);

      expect(weeklyLogsRepository.save).toHaveBeenCalledWith({
        ...mockLog,
        companyGrade: "8.5",
        companyFeedback: "Buen trabajo",
      });
      expect(result.companyGrade).toBe("8.5");
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.grade("no-existe", { academicGrade: "9.0" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("debe eliminar la bitácora", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(mockLog);
      weeklyLogsRepository.remove.mockResolvedValue(mockLog);

      const result = await service.remove(LOG_ID);

      expect(weeklyLogsRepository.remove).toHaveBeenCalledWith(mockLog);
      expect(result.message).toBeDefined();
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      weeklyLogsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("no-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
