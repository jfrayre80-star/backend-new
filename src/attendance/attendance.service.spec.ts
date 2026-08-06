import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AttendanceService } from './attendance.service';
import { Schedules } from '../academic/Schedules';
import { QrCodes } from './QrCodes';
import { Students } from '../users/Students';
import { AttendanceRecords } from './AttendanceRecords';
import { Justifications } from './Justifications';
import { GroupEnrollments } from '../academic/GroupEnrollments';
import { AccessLogs } from './AccessLogs';
import { Parents } from '../users/Parents';
import { NotificationQueueService } from '../notifications/notification-queue.service';

describe('AttendanceService — RF-15 y RF-14', () => {
  let service: AttendanceService;

  const accessLogsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };
  const studentsRepository = {
    findOne: jest.fn(),
  };
  const notificationQueueService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: getRepositoryToken(Schedules), useValue: { findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(QrCodes), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(Students), useValue: studentsRepository },
        { provide: getRepositoryToken(AttendanceRecords), useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(Justifications), useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(GroupEnrollments), useValue: { find: jest.fn(), findOne: jest.fn() } },
        { provide: getRepositoryToken(AccessLogs), useValue: accessLogsRepository },
        { provide: getRepositoryToken(Parents), useValue: { findOne: jest.fn() } },
        { provide: NotificationQueueService, useValue: notificationQueueService },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  const baseDto = (eventType: 'entry' | 'exit') => ({
    studentId: '11111111-1111-1111-1111-111111111111',
    eventType,
    scannedAt: new Date('2026-01-12T13:00:00Z'),
    deviceTerminalId: 'TERMINAL-01',
  });

  const makeLog = (overrides: Partial<AccessLogs>) => ({ ...overrides }) as AccessLogs;

  describe('RF-15: trazabilidad de salidas temporales y reingresos', () => {
    it('una primera entrada no es retorno y no requiere retorno', async () => {
      // Sin historial previo del alumno.
      accessLogsRepository.findOne.mockResolvedValue(null);
      accessLogsRepository.create.mockImplementation((data) => ({ ...data }));
      accessLogsRepository.save.mockImplementation(async (log) => ({ ...log, id: 'log-1' }));

      const result = await service.createAccessLog(baseDto('entry') as any);

      expect(result.log.isExitReturn).toBe(false);
      expect(result.log.requiresReturn).toBe(false);
    });

    it('una salida con el alumno dentro requiere retorno', async () => {
      accessLogsRepository.findOne.mockResolvedValue(
        makeLog({ studentId: baseDto('exit').studentId, eventType: 'entry', requiresReturn: false }),
      );
      accessLogsRepository.create.mockImplementation((data) => ({ ...data }));
      accessLogsRepository.save.mockImplementation(async (log) => ({ ...log, id: 'log-2' }));

      const result = await service.createAccessLog(baseDto('exit') as any);

      expect(result.log.requiresReturn).toBe(true);
    });

    it('una entrada después de una salida pendiente es un reingreso y cierra la salida', async () => {
      accessLogsRepository.findOne.mockResolvedValue(
        makeLog({ studentId: baseDto('entry').studentId, eventType: 'exit', requiresReturn: true }),
      );
      accessLogsRepository.create.mockImplementation((data) => ({ ...data }));
      accessLogsRepository.save.mockImplementation(async (log) => ({ ...log, id: 'log-3' }));

      // El alumno no tiene padre vinculado → no intenta notificación (evita queries extras).
      studentsRepository.findOne.mockResolvedValue({ id: baseDto('entry').studentId, parent: null });

      const result = await service.createAccessLog(baseDto('entry') as any);

      expect(result.log.isExitReturn).toBe(true);
      expect(result.log.requiresReturn).toBe(false);
      // Debe cerrar la salida temporal pendiente.
      expect(accessLogsRepository.update).toHaveBeenCalledWith(
        { studentId: baseDto('entry').studentId, requiresReturn: true },
        { requiresReturn: false },
      );
    });
  });

  describe('RF-14: notificación al padre al sincronizar acceso', () => {
    it('encola una notificación push para el padre cuando el alumno tiene padre', async () => {
      accessLogsRepository.findOne.mockResolvedValue(null);
      accessLogsRepository.create.mockImplementation((data) => ({ ...data }));
      accessLogsRepository.save.mockImplementation(async (log) => ({ ...log, id: 'log-4' }));

      studentsRepository.findOne.mockResolvedValue({
        id: baseDto('entry').studentId,
        parent: { id: 'parent-1' },
        user: { firstName: 'Juan', lastName: 'Pérez' },
      });

      await service.syncSingleAccessLog(baseDto('entry') as any);

      expect(notificationQueueService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'push',
          payload: expect.objectContaining({
            toParentId: 'parent-1',
            eventType: 'entry',
            studentName: 'Juan Pérez',
          }),
        }),
      );
    });

    it('no encola notificación si el alumno no tiene padre vinculado', async () => {
      accessLogsRepository.findOne.mockResolvedValue(null);
      accessLogsRepository.create.mockImplementation((data) => ({ ...data }));
      accessLogsRepository.save.mockImplementation(async (log) => ({ ...log, id: 'log-5' }));

      studentsRepository.findOne.mockResolvedValue({
        id: baseDto('exit').studentId,
        parent: null,
        user: null,
      });

      await service.syncSingleAccessLog(baseDto('exit') as any);

      expect(notificationQueueService.create).not.toHaveBeenCalled();
    });
  });
});
