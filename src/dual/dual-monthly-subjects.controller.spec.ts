import { Test, TestingModule } from '@nestjs/testing';

import { DualMonthlySubjectsController } from './dual-monthly-subjects.controller';
import { DualMonthlySubjectsService } from './dual-monthly-subjects.service';
import { CreateDualMonthlySubjectDto } from './dto/create-dual-monthly-subject.dto';
import { UpdateDualMonthlySubjectDto } from './dto/update-dual-monthly-subject.dto';

describe('DualMonthlySubjectsController', () => {
  let controller: DualMonthlySubjectsController;
  let service: DualMonthlySubjectsService;

  const mockService = {
    findAll: jest.fn(),
    findByEnrollment: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRecord = { id: '11111111-1111-1111-1111-111111111111' };
  const mockDto: CreateDualMonthlySubjectDto = {
    dualEnrollmentId: '22222222-2222-2222-2222-222222222222',
    subjectId: '33333333-3333-3333-3333-333333333333',
    month: 3,
    year: 2026,
    isTroncoComun: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DualMonthlySubjectsController],
      providers: [
        {
          provide: DualMonthlySubjectsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DualMonthlySubjectsController>(
      DualMonthlySubjectsController,
    );
    service = module.get<DualMonthlySubjectsService>(
      DualMonthlySubjectsService,
    );
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('GET / debe llamar findAll', async () => {
    mockService.findAll.mockResolvedValue([mockRecord]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRecord]);
  });

  it('GET /enrollment/:id debe llamar findByEnrollment', async () => {
    mockService.findByEnrollment.mockResolvedValue([mockRecord]);

    const result = await controller.findByEnrollment(
      '22222222-2222-2222-2222-222222222222',
    );

    expect(service.findByEnrollment).toHaveBeenCalledWith(
      '22222222-2222-2222-2222-222222222222',
    );
    expect(result).toEqual([mockRecord]);
  });

  it('GET /:id debe llamar findOne', async () => {
    mockService.findOne.mockResolvedValue(mockRecord);

    const result = await controller.findOne(mockRecord.id);

    expect(service.findOne).toHaveBeenCalledWith(mockRecord.id);
    expect(result).toEqual(mockRecord);
  });

  it('POST debe llamar create', async () => {
    mockService.create.mockResolvedValue(mockRecord);

    const result = await controller.create(mockDto);

    expect(service.create).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(mockRecord);
  });

  it('PATCH debe llamar update', async () => {
    const updateDto: UpdateDualMonthlySubjectDto = { month: 4 };
    mockService.update.mockResolvedValue({ ...mockRecord, ...updateDto });

    const result = await controller.update(mockRecord.id, updateDto);

    expect(service.update).toHaveBeenCalledWith(mockRecord.id, updateDto);
    expect(result).toEqual({ ...mockRecord, ...updateDto });
  });

  it('DELETE debe llamar remove', async () => {
    mockService.remove.mockResolvedValue({ message: 'eliminada' });

    const result = await controller.remove(mockRecord.id);

    expect(service.remove).toHaveBeenCalledWith(mockRecord.id);
    expect(result.message).toBeDefined();
  });
});
