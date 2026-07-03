import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';

@Module({
  providers: [ClassroomsService]
})
export class ClassroomsModule {}
