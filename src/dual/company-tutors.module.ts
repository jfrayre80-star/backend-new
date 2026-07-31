import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyTutors } from './CompanyTutors';

import { CompanyTutorsController } from './company-tutors.controller';
import { CompanyTutorsService } from './company-tutors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyTutors,
    ]),
  ],
  controllers: [CompanyTutorsController],
  providers: [CompanyTutorsService],
  exports: [CompanyTutorsService],
})
export class CompanyTutorsModule {}
