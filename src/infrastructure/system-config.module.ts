import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './SystemConfig';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  controllers: [SystemConfigController],
  providers: [SystemConfigService],
})
export class SystemConfigModule {}
