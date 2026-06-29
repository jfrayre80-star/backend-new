import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from './Users';
import { Teachers } from './Teachers';
import { Admins } from './Admins';
import { Parents } from './Parents';
import { Students } from './Students';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teachers.dto';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';
import { CreateParentDto, UpdateParentDto } from './dto/parents.dto';
import { CreateStudentDto, UpdateStudentDto } from './dto/students.dto';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { RegisterAdminDto, RegisterTeacherDto, RegisterParentDto, RegisterStudentDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(Teachers) private readonly teachersRepo: Repository<Teachers>,
    @InjectRepository(Admins) private readonly adminsRepo: Repository<Admins>,
    @InjectRepository(Parents) private readonly parentsRepo: Repository<Parents>,
    @InjectRepository(Students) private readonly studentsRepo: Repository<Students>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // ─── Users ───
  findAllUsers(): Promise<Users[]> {
    return this.usersRepo.find();
  }

  async findOneUser(id: string): Promise<Users> {
    const u = await this.usersRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return u;
  }

  async createUser(dto: CreateUserDto): Promise<Users> {
    return this.usersRepo.save(this.usersRepo.create({
      ...dto, passwordHash: await this.hashPassword(dto.passwordHash),
    }));
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<Users> {
    const user = await this.findOneUser(id);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findOneUser(id);
    user.isActive = false;
    await this.usersRepo.save(user);
  }

  // ─── Teachers ───
  findAllTeachers(): Promise<Teachers[]> {
    return this.teachersRepo.find({ relations: { user: true } });
  }

  async findOneTeacher(id: string): Promise<Teachers> {
    const t = await this.teachersRepo.findOne({ where: { id }, relations: { user: true } });
    if (!t) throw new NotFoundException(`Teacher ${id} no encontrado`);
    return t;
  }

  createTeacher(dto: CreateTeacherDto): Promise<Teachers> {
    return this.teachersRepo.save(this.teachersRepo.create({
      employeeCode: dto.employeeCode,
      specialization: dto.specialization,
      hireDate: dto.hireDate,
      user: { id: dto.userId },
    }));
  }

  async updateTeacher(id: string, dto: UpdateTeacherDto): Promise<Teachers> {
    const teacher = await this.findOneTeacher(id);
    Object.assign(teacher, dto);
    return this.teachersRepo.save(teacher);
  }

  async removeTeacher(id: string): Promise<void> {
    const teacher = await this.findOneTeacher(id);
    await this.teachersRepo.remove(teacher);
  }

  // ─── Admins ───
  findAllAdmins(): Promise<Admins[]> {
    return this.adminsRepo.find({ relations: { user: true } });
  }

  async findOneAdmin(id: string): Promise<Admins> {
    const a = await this.adminsRepo.findOne({ where: { id }, relations: { user: true } });
    if (!a) throw new NotFoundException(`Admin ${id} no encontrado`);
    return a;
  }

  createAdmin(dto: CreateAdminDto): Promise<Admins> {
    return this.adminsRepo.save(this.adminsRepo.create({
      employeeCode: dto.employeeCode,
      department: dto.department,
      hireDate: dto.hireDate,
      user: { id: dto.userId },
    }));
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<Admins> {
    const admin = await this.findOneAdmin(id);
    Object.assign(admin, dto);
    return this.adminsRepo.save(admin);
  }

  async removeAdmin(id: string): Promise<void> {
    const admin = await this.findOneAdmin(id);
    await this.adminsRepo.remove(admin);
  }

  // ─── Parents ───
  findAllParents(): Promise<Parents[]> {
    return this.parentsRepo.find({ relations: { user: true } });
  }

  async findOneParent(id: string): Promise<Parents> {
    const p = await this.parentsRepo.findOne({ where: { id }, relations: { user: true } });
    if (!p) throw new NotFoundException(`Parent ${id} no encontrado`);
    return p;
  }

  createParent(dto: CreateParentDto): Promise<Parents> {
    return this.parentsRepo.save(this.parentsRepo.create({
      phoneSecondary: dto.phoneSecondary,
      emergencyContact: dto.emergencyContact,
      occupation: dto.occupation,
      user: { id: dto.userId },
    }));
  }

  async updateParent(id: string, dto: UpdateParentDto): Promise<Parents> {
    const parent = await this.findOneParent(id);
    Object.assign(parent, dto);
    return this.parentsRepo.save(parent);
  }

  async removeParent(id: string): Promise<void> {
    const parent = await this.findOneParent(id);
    await this.parentsRepo.remove(parent);
  }

  // ─── Register compuestos (user + rol en 1) ───

  async registerAdmin(dto: RegisterAdminDto) {
    const user = await this.usersRepo.save(this.usersRepo.create({
      email: dto.email, passwordHash: await this.hashPassword(dto.passwordHash),
      firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'admin',
    }));
    const admin = await this.adminsRepo.save(this.adminsRepo.create({
      employeeCode: dto.employeeCode, department: dto.department, user: { id: user.id },
    }));
    return { ...admin, user };
  }

  async registerTeacher(dto: RegisterTeacherDto) {
    const user = await this.usersRepo.save(this.usersRepo.create({
      email: dto.email, passwordHash: await this.hashPassword(dto.passwordHash),
      firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'teacher',
    }));
    const teacher = await this.teachersRepo.save(this.teachersRepo.create({
      employeeCode: dto.employeeCode, specialization: dto.specialization, user: { id: user.id },
    }));
    return { ...teacher, user };
  }

  async registerParent(dto: RegisterParentDto) {
    const user = await this.usersRepo.save(this.usersRepo.create({
      email: dto.email, passwordHash: await this.hashPassword(dto.passwordHash),
      firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'parent',
    }));
    const parent = await this.parentsRepo.save(this.parentsRepo.create({
      phoneSecondary: dto.phoneSecondary, emergencyContact: dto.emergencyContact,
      occupation: dto.occupation, user: { id: user.id },
    }));
    return { ...parent, user };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const parentUser = await this.usersRepo.save(this.usersRepo.create({
      email: dto.parentEmail, passwordHash: await this.hashPassword(dto.parentPassword),
      firstName: dto.parentFirstName, lastName: dto.parentLastName,
      phone: dto.parentPhone ?? null, role: 'parent',
    }));
    const parent = await this.parentsRepo.save(this.parentsRepo.create({
      phoneSecondary: dto.parentPhoneSecondary,
      occupation: dto.parentOccupation, user: { id: parentUser.id },
    }));
    const user = await this.usersRepo.save(this.usersRepo.create({
      email: dto.email, passwordHash: await this.hashPassword(dto.passwordHash),
      firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'student',
    }));
    const student = await this.studentsRepo.save(this.studentsRepo.create({
      userId: user.id, parentId: parent.id, enrollmentNumber: dto.enrollmentNumber,
      birthDate: dto.birthDate, specialtyId: dto.specialtyId,
    }));
    return { ...student, user, parent: { ...parent, user: parentUser } };
  }

  // ─── Students ───
  findAllStudents(): Promise<Students[]> {
    return this.studentsRepo.find({ relations: { user: true, parent: true, specialty: true, currentSemester: true } });
  }

  async findOneStudent(id: string): Promise<Students> {
    const s = await this.studentsRepo.findOne({
      where: { id },
      relations: { user: true, parent: true, specialty: true, currentSemester: true },
    });
    if (!s) throw new NotFoundException(`Student ${id} no encontrado`);
    return s;
  }

  createStudent(dto: CreateStudentDto): Promise<Students> {
    return this.studentsRepo.save(this.studentsRepo.create(dto));
  }

  async updateStudent(id: string, dto: UpdateStudentDto): Promise<Students> {
    const student = await this.findOneStudent(id);
    Object.assign(student, dto);
    return this.studentsRepo.save(student);
  }

  async removeStudent(id: string): Promise<void> {
    const student = await this.findOneStudent(id);
    await this.studentsRepo.remove(student);
  }
}
