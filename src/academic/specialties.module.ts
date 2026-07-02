import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Specialties} from './Specialties';
import {SpecialtiesService} from './specialties.service';
import {SpecialtiesController} from './specialties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Specialties])],
  providers: [SpecialtiesService],
  controllers: [SpecialtiesController],
  exports: [SpecialtiesService]
})
export class SpecialtiesModule {}