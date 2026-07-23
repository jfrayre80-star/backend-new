import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicHistory } from './AcademicHistory';
import { SemesterGrades } from './SemesterGrades';
import { EvaluationSchemes } from '../evaluation/EvaluationSchemes';
import { SemesterConfigs } from './SemesterConfigs';
import { Exams } from '../exams/Exams';
import { ExamAttempts } from '../exams/ExamAttempts';
import { Students } from '../users/Students';
import { Subjects } from '../academic/Subjects';
import { Semesters } from '../academic/Semesters';
import { CreateAcademicHistoryDto } from './dto/create-academic-history.dto';
import { UpdateAcademicHistoryDto } from './dto/update-academic-history.dto';

@Injectable()
export class AcademicHistoryService {
  constructor(
    @InjectRepository(AcademicHistory)
    private readonly academicHistoryRepository: Repository<AcademicHistory>,
    @InjectRepository(SemesterGrades)
    private readonly semesterGradesRepository: Repository<SemesterGrades>,
    @InjectRepository(EvaluationSchemes)
    private readonly evaluationSchemesRepository: Repository<EvaluationSchemes>,
    @InjectRepository(SemesterConfigs)
    private readonly semesterConfigsRepository: Repository<SemesterConfigs>,
    @InjectRepository(Exams)
    private readonly examsRepository: Repository<Exams>,
    @InjectRepository(ExamAttempts)
    private readonly examAttemptsRepository: Repository<ExamAttempts>,
    @InjectRepository(Students)
    private readonly studentsRepository: Repository<Students>,
    @InjectRepository(Subjects)
    private readonly subjectsRepository: Repository<Subjects>,
    @InjectRepository(Semesters)
    private readonly semestersRepository: Repository<Semesters>,
  ) {}

  // Retorna todo el historial académico
  async findAll() {
    return await this.academicHistoryRepository.find({
      relations: { student: true, subject: true, semester: true, evaluationScheme: true },
    });
  }

  // Retorna un registro del historial por ID
  async findOne(id: string) {
    const history = await this.academicHistoryRepository.findOne({
      where: { id },
      relations: { student: true, subject: true, semester: true, evaluationScheme: true },
    });
    if (!history) throw new NotFoundException('Registro de historial académico no encontrado.');
    return history;
  }

  // Retorna el historial completo de un alumno
  async findByStudent(studentId: string) {
    const student = await this.studentsRepository.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    return await this.academicHistoryRepository.find({
      where: { studentId },
      relations: { subject: true, semester: true, evaluationScheme: true },
    });
  }

  // Crea un registro manual en el historial
  async create(dto: CreateAcademicHistoryDto) {
    const student = await this.studentsRepository.findOne({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    const subject = await this.subjectsRepository.findOne({ where: { id: dto.subjectId } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    const semester = await this.semestersRepository.findOne({ where: { id: dto.semesterId } });
    if (!semester) throw new NotFoundException('Semestre no encontrado.');

    // Verificar que no exista un registro para el mismo alumno + materia + semestre
    const existing = await this.academicHistoryRepository.findOne({
      where: { studentId: dto.studentId, subjectId: dto.subjectId, semesterId: dto.semesterId },
    });
    if (existing) throw new BadRequestException('Ya existe un registro en el historial para este alumno, materia y semestre.');

    const history = this.academicHistoryRepository.create(dto);
    return await this.academicHistoryRepository.save(history);
  }

  // Cierra el semestre para un alumno en una materia:
  // 1. Busca el promedio de parciales (partialsAverage)
  // 2. Busca la nota del examen semestral
  // 3. Calcula finalGrade = (partialsAverage * 80%) + (semesterExamScore * 20%)
  // 4. Determina isApproved (finalGrade >= 60)
  async closeSemester(studentId: string, subjectId: string, semesterId: string) {
    const student = await this.studentsRepository.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    const subject = await this.subjectsRepository.findOne({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    const semester = await this.semestersRepository.findOne({ where: { id: semesterId } });
    if (!semester) throw new NotFoundException('Semestre no encontrado.');

    // Buscar el esquema de evaluación para esta materia
    const evalScheme = await this.evaluationSchemesRepository.findOne({
      where: { subjectId },
    });

    // Buscar la calificación semestral (promedio de parciales)
    const semesterGrade = await this.semesterGradesRepository.findOne({
      where: { studentId, subjectId },
    });

    // Buscar el examen semestral (category = 'semestral')
    const semestralExam = await this.examsRepository.findOne({
      where: { subjectId, examCategory: 'semestral' },
    });

    // Buscar el intento calificado del alumno en ese examen semestral
    let semesterExamScore = 0;
    if (semestralExam) {
      const attempt = await this.examAttemptsRepository.findOne({
        where: { examId: semestralExam.id, studentId, status: 'graded' },
      });
      // Usar el totalScore del intento (autoScore + manualScore)
      semesterExamScore = attempt ? parseFloat(attempt.totalScore || '0') : 0;
    }

    const partialsAverage = semesterGrade ? parseFloat(semesterGrade.total || '0') : 0;

    // Obtener pesos del esquema de evaluación (default 80/20)
    const partialsWeight = evalScheme ? parseFloat(evalScheme.partialsWeight || '80') / 100 : 0.8;
    const semesterWeight = evalScheme ? parseFloat(evalScheme.semesterWeight || '20') / 100 : 0.2;

    // Calcular nota final
    const finalGrade = (partialsAverage * partialsWeight + semesterExamScore * semesterWeight).toFixed(2);

    // Aprobar si la nota final >= 60
    const isApproved = parseFloat(finalGrade) >= 60;

    // Buscar o crear el registro en el historial
    let history = await this.academicHistoryRepository.findOne({
      where: { studentId, subjectId, semesterId },
    });

    if (history) {
      history.partialsAverage = partialsAverage.toFixed(2);
      history.semesterExamScore = semesterExamScore.toFixed(2);
      history.finalGrade = finalGrade;
      history.isApproved = isApproved;
    } else {
      history = this.academicHistoryRepository.create({
        studentId,
        subjectId,
        semesterId,
        partialsAverage: partialsAverage.toFixed(2),
        semesterExamScore: semesterExamScore.toFixed(2),
        finalGrade,
        isApproved,
      });
    }

    return await this.academicHistoryRepository.save(history);
  }

  // Actualiza un registro del historial
  async update(id: string, dto: UpdateAcademicHistoryDto) {
    const history = await this.findOne(id);
    Object.assign(history, dto);
    return await this.academicHistoryRepository.save(history);
  }

  // Elimina un registro del historial
  async remove(id: string) {
    const history = await this.findOne(id);
    await this.academicHistoryRepository.remove(history);
    return { message: 'Registro de historial académico eliminado correctamente.' };
  }
}
