import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { DualMonthlySubjectsService } from './dual-monthly-subjects.service';
import { DualMonthlySubjects } from './DualMonthlySubjects';
import { DualEnrollments } from './DualEnrollments';
import { Subjects } from '../academic/Subjects';
import { CreateDualMonthlySubjectDto } from './dto/create-dual-monthly-subject.dto';

describe('DualMonthlySubjectsService', () => {
  let service: DualMonthlySubjectsService;

  const dmsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const dualEnrollmentsRepository = {
    findOne: jest.fn(),
  };
  const subjectsRepository = {
    findOne: jest.fn(),
  };

  const mockRecord: DualMonthlySubjects = {
    id: '11111111-1111-1111-1111-111111111111',
    dualEnrollmentId: '22222222-2222-2222-2222-222222222222',
    subjectId: '33333333-3333-3333-3333-333333333333',
    month: 3,
    year: 2026,
    isTroncoComun: true,
    dualEnrollment: null as any,
    subject: null as any,
  };

  const mockEnrollment: DualEnrollments = {
    id: '22222222-2222-2222-2222-222222222222',
    studentId: '44444444-4444-4444-4444-444444444444',
    companyTutorId: '55555555-5555-5555-5555-555555555555',
    academicTutorId: '66666666-6666-6666-6666-666666666666',
    startDate: '2026-01-12',
    endDate: null,
    isActive: true,
    academicTutor: null as any,
    companyTutor: null as any,
    student: null as any,
    dualMonthlySubjects: [],
  };

  const mockSubject: Subjects = {
    id: '33333333-3333-3333-3333-333333333333',
    code: 'MAT-101',
    name: 'Matemáticas I',
    description: null,
    imageUrl: null,
    credits: 5,
    isActive: true,
    specialty: null as any,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DualMonthlySubjectsService,
        {
          provide: getRepositoryToken(DualMonthlySubjects),
          useValue: dmsRepository,
        },
        {
          provide: getRepositoryToken(DualEnrollments),
          useValue: dualEnrollmentsRepository,
        },
        {
          provide: getRepositoryToken(Subjects),
          useValue: subjectsRepository,
        },
      ],
    }).compile();

    service = module.get<DualMonthlySubjectsService>(
      DualMonthlySubjectsService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe listar todos los registros ordenados por año/mes', async () => {
      dmsRepository.find.mockResolvedValue([mockRecord]);

      const result = await service.findAll();

      expect(dmsRepository.find).toHaveBeenCalledWith({
        order: { year: 'DESC', month: 'DESC' },
      });
      expect(result).toEqual([mockRecord]);
    });
  });

  describe('findOne', () => {
    it('debe retornar el registro si existe', async () => {
      dmsRepository.findOne.mockResolvedValue(mockRecord);

      const result = await service.findOne(mockRecord.id);

      expect(dmsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
      });
      expect(result).toEqual(mockRecord);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      dmsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEnrollment', () => {
    it('debe listar los registros de una inscripción', async () => {
      dmsRepository.find.mockResolvedValue([mockRecord]);

      const result = await service.findByEnrollment(
        mockRecord.dualEnrollmentId,
      );

      expect(dmsRepository.find).toHaveBeenCalledWith({
        where: { dualEnrollmentId: mockRecord.dualEnrollmentId },
        order: { month: 'ASC', year: 'ASC' },
      });
      expect(result).toEqual([mockRecord]);
    });
  });

  describe('create', () => {
    const dto: CreateDualMonthlySubjectDto = {
      dualEnrollmentId: mockRecord.dualEnrollmentId,
      subjectId: mockRecord.subjectId,
      month: 3,
      year: 2026,
      isTroncoComun: true,
    };

    it('debe crear el registro cuando todo es válido', async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      subjectsRepository.findOne.mockResolvedValue(mockSubject);
      dmsRepository.findOne.mockResolvedValue(null);
      dmsRepository.create.mockReturnValue(mockRecord);
      dmsRepository.save.mockResolvedValue(mockRecord);

      const result = await service.create(dto);

      expect(dualEnrollmentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.dualEnrollmentId },
      });
      expect(subjectsRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.subjectId },
      });
      expect(dmsRepository.create).toHaveBeenCalledWith(dto);
      expect(dmsRepository.save).toHaveBeenCalledWith(mockRecord);
      expect(result).toEqual(mockRecord);
    });

    it('debe rechazar si la inscripción dual no existe', async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(subjectsRepository.findOne).not.toHaveBeenCalled();
    });

    it('debe rechazar si la materia no existe', async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      subjectsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('debe rechazar duplicados (mismo alumno/materia/mes/año)', async () => {
      dualEnrollmentsRepository.findOne.mockResolvedValue(mockEnrollment);
      subjectsRepository.findOne.mockResolvedValue(mockSubject);
      dmsRepository.findOne.mockResolvedValue(mockRecord);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('debe actualizar un registro existente', async () => {
      dmsRepository.findOne.mockResolvedValue(mockRecord);
      dmsRepository.findOne.mockResolvedValueOnce(mockRecord); // findOne(id)
      dualEnrollmentsRepository.findOne.mockResolvedValue(null);
      dmsRepository.findOne.mockResolvedValueOnce(null); // duplicado

      const result = await service.update(mockRecord.id, { month: 4 });

      expect(dmsRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      dmsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('no-existe', { month: 4 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar físicamente el registro', async () => {
      dmsRepository.findOne.mockResolvedValue(mockRecord);
      dmsRepository.remove.mockResolvedValue(mockRecord);

      const result = await service.remove(mockRecord.id);

      expect(dmsRepository.remove).toHaveBeenCalledWith(mockRecord);
      expect(result.message).toBeDefined();
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      dmsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
