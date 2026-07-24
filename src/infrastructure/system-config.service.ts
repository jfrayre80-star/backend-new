import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './SystemConfig';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/system-config.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig) private readonly configRepo: Repository<SystemConfig>,
  ) {}

  findAll(): Promise<SystemConfig[]> {
    return this.configRepo.find({ order: { key: 'ASC' } });
  }

  async findOne(id: string): Promise<SystemConfig> {
    const c = await this.configRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException(`Config ${id} no encontrada`);
    return c;
  }

  async findByKey(key: string): Promise<SystemConfig> {
    const c = await this.configRepo.findOne({ where: { key } });
    if (!c) throw new NotFoundException(`Config con key "${key}" no encontrada`);
    return c;
  }

  async create(dto: CreateSystemConfigDto): Promise<SystemConfig> {
    const exists = await this.configRepo.findOne({ where: { key: dto.key } });
    if (exists) throw new ConflictException(`La key "${dto.key}" ya existe`);
    return this.configRepo.save(this.configRepo.create(dto));
  }

  async update(id: string, dto: UpdateSystemConfigDto): Promise<SystemConfig> {
    const config = await this.findOne(id);
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepo.remove(config);
  }
}
