import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";

import { DualEnrollmentsService } from "./dual-enrollments.service";
import { DualEnrollments } from "./DualEnrollments";
import { Students } from "../users/Students";
import { Teachers } from "../users/Teachers";
import { CompanyTutors } from "./CompanyTutors";
import { CreateDualEnrollmentDto } from "./dto/create-dual-enrollment.dto";

describe("DualEnrollmentsService", () => {
  let service: DualEnrollmentsService;

  const dualEnrollmentsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const studentsRepository = {
    findOne: jest.fn(),
  };
  const teachersRepository = {
    findOne: jest.fn(),
  };
  const companyTutorsRepository = {
    findOne: jest.fn(),
  };

  const STUDENT_ID = "44444444-4444-4444-4444-444444444444";
  const COMPANY_TUTOR_ID = "55555555-5555-5555-5555-555555555555";
  const ACADEMIC_TUTOR_ID = "66666666-6666-6666-6666-666666666666";
  const ENROLLMENT_ID = "22222222-2222-2222-2222-222222222222";

  const mockEnrollment: DualEnrollments = {
    id: ENROLLMENT_ID,
    studentId: STUDENT_ID,
    companyTutorId: COMPANY_TUTOR_ID,
    academicTutorId: ACADEMIC_TUTOR_ID,
    startDate: "2026-01-12",
    endDate: null,
    isActive: true,
    academicTutor: null as any,
    companyTutor: null as any,
    student: null as any,
    dualMonthlySubjects: [],
  };

  const mockStudent: Partial<Students> = {
    id: STUDENT_ID,
    userId: "77777777-7777-7777-7777-777777777777",
    parentId: "88888888-8888-8888-8888-888888888888",
    enrollmentNumber: "2024-001",
  };

  const mockTeacher: Partial<Teachers> = {
    id: ACADEMIC_TUTOR_ID,
    userId: "99999999-9999-9999-9999-999999999999",
  };

  const mockCompanyTutor: Partial<CompanyTutors> = {
    id: COMPANY_TUTOR_ID,
    fullName: "María Empresa",
    phone: "555-0101",
    companyName: "Tecno Corp",
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DualEnrollmentsService,
        {
          provide: getRepositoryToken(DualEnrollments),
          useValue: dualEnrollmentsRepository,
        },
        {
          provide: getRepositoryToken(Students),
          useValue: studentsRepository,
        },
        {
          provide: getRepositoryToken(Teachers),
          useValue: teachersRepository,
        },
        {
          provide: getRepositoryToken(CompanyTutors),
          useValue: companyTutorsRepository,
        },
      ],
    }).compile();

    service = module.get<DualEnrollmentsService>(DualEnrollmentsService);
  });

  it("debe estar definido", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("debe listar las inscripciones con sus relaciones ordenadas por fecha", async () => {
      dualEnrollmentsRepository.find.mockResolvedValue([mockEnrollment]);

      const result = await service.findAll();

      expect(dualEnrollmentsRepository.find).toHaveBeenCalledWith({
        relations: {
          student: { user: true },
          companyTutor: true,
          academicTutor: { user: true },
        },
        order: { startDate: "DESC" },
      });
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe("findOne", () => {
    it("debe retornar la inscripción si existe", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);

      const result = await service.findOne(ENROLLMENT_ID);

      expect(dualEnrollmentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: ENROLLMENT_ID },
        relations: {
          student: { user: true },
          companyTutor: true,
          academicTutor: { user: true },
          dualMonthlySubjects: true,
        },
      });
      expect(result).toEqual(mockEnrollment);
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("no-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByStudent", () => {
    it("debe listar las inscripciones del alumno", async () => {
      dualEnrollmentsRepository.find.mockResolvedValue([mockEnrollment]);

      const result = await service.findByStudent(STUDENT_ID);

      expect(dualEnrollmentsRepository.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_ID },
        relations: {
          companyTutor: true,
          academicTutor: { user: true },
          dualMonthlySubjects: true,
        },
      });
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe("create", () => {
    const dto: CreateDualEnrollmentDto = {
      studentId: STUDENT_ID,
      companyTutorId: COMPANY_TUTOR_ID,
      academicTutorId: ACADEMIC_TUTOR_ID,
      startDate: "2026-01-12",
      isActive: true,
    };

    it("debe crear la inscripción cuando todo es válido", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      companyTutorsRepository.findOne.mockResolvedValue(mockCompanyTutor);
      teachersRepository.findOne.mockResolvedValue(mockTeacher);
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);
      dualEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
      dualEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);

      const result = await service.create(dto);

      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.studentId },
      });
      expect(companyTutorsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.companyTutorId },
      });
      expect(teachersRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.academicTutorId },
      });
      expect(dualEnrollmentsRepository.create).toHaveBeenCalledWith(dto);
      expect(dualEnrollmentsRepository.save).toHaveBeenCalledWith(
        mockEnrollment,
      );
      expect(result).toEqual(mockEnrollment);
    });

    it("debe rechazar si el alumno no existe", async () => {
      studentsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(companyTutorsRepository.findOne).not.toHaveBeenCalled();
    });

    it("debe rechazar si el tutor de empresa no existe", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      companyTutorsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(teachersRepository.findOne).not.toHaveBeenCalled();
    });

    it("debe rechazar si el tutor académico no existe", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      companyTutorsRepository.findOne.mockResolvedValue(mockCompanyTutor);
      teachersRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it("debe rechazar si el alumno ya está inscrito al programa dual", async () => {
      studentsRepository.findOne.mockResolvedValue(mockStudent);
      companyTutorsRepository.findOne.mockResolvedValue(mockCompanyTutor);
      teachersRepository.findOne.mockResolvedValue(mockTeacher);
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("debe actualizar una inscripción existente", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      dualEnrollmentsRepository.save.mockResolvedValue({
        ...mockEnrollment,
        isActive: false,
      });

      const result = await service.update(ENROLLMENT_ID, {
        isActive: false,
      });

      expect(dualEnrollmentsRepository.save).toHaveBeenCalled();
      expect(result.isActive).toBe(false);
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("no-existe", { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });

    it("debe validar el tutor académico si se cambia", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      teachersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(ENROLLMENT_ID, { academicTutorId: "nuevo-tutor" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("debe eliminar la inscripción", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      dualEnrollmentsRepository.remove.mockResolvedValue(mockEnrollment);

      const result = await service.remove(ENROLLMENT_ID);

      expect(dualEnrollmentsRepository.remove).toHaveBeenCalledWith(
        mockEnrollment,
      );
      expect(result.message).toBeDefined();
    });

    it("debe lanzar NotFoundException si no existe", async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("no-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
