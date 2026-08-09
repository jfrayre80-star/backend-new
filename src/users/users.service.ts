import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from './Users';
import { Teachers } from './Teachers';
import { Admins } from './Admins';
import { Parents } from './Parents';
import { Students } from './Students';
import { UpdateTeacherDto } from './dto/teachers.dto';
import { UpdateAdminDto } from './dto/admins.dto';
import { UpdateParentDto } from './dto/parents.dto';
import { UpdateStudentDto } from './dto/students.dto';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { RegisterAdminDto, RegisterTeacherDto, RegisterParentDto, RegisterStudentDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(Teachers) private readonly teachersRepo: Repository<Teachers>,
    @InjectRepository(Admins) private readonly adminsRepo: Repository<Admins>,
    @InjectRepository(Parents) private readonly parentsRepo: Repository<Parents>,
    @InjectRepository(Students) private readonly studentsRepo: Repository<Students>,
  ) {}

  private async checkEmail(email: string): Promise<void> {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException(`El email ${email} ya está registrado`);
  }

  async login(identifier: string, password: string) {
    let user = await this.usersRepo.findOne({ where: { email: identifier, isActive: true } });
    if (!user) {
      const student = await this.studentsRepo.findOne({
        where: { enrollmentNumber: identifier },
        relations: { user: true },
      });
      user = student?.user ?? null;
    }
    if (!user) {
      const teacher = await this.teachersRepo.findOne({
        where: { employeeCode: identifier },
        relations: { user: true },
      });
      user = teacher?.user ?? null;
    }
    if (!user) {
      const admin = await this.adminsRepo.findOne({
        where: { employeeCode: identifier },
        relations: { user: true },
      });
      user = admin?.user ?? null;
    }
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');
    user.lastLogin = new Date();
    await this.usersRepo.save(user);
    const { passwordHash, ...profile } = user;
    return profile;
  }

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
      email: dto.email, passwordHash: await this.hashPassword(dto.password),
      firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: dto.role,
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

  /**
   * RF-06: Cambio de contraseña del propio usuario. Requiere la contraseña
   * actual para autorizar, la hashea y limpia el indicador de contraseña
   * temporal (mustChangePassword).
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOneUser(userId);
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('La contraseña actual es incorrecta.');
    if (newPassword === currentPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual.');
    }
    user.passwordHash = await this.hashPassword(newPassword);
    user.mustChangePassword = false;
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
    await this.checkEmail(dto.email);
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(Users, manager.create(Users, {
        email: dto.email, passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'admin',
      }));
      const admin = await manager.save(Admins, manager.create(Admins, {
        employeeCode: dto.employeeCode, department: dto.department, user: { id: user.id },
      }));
      return { ...admin, user };
    });
  }

  async registerTeacher(dto: RegisterTeacherDto) {
    await this.checkEmail(dto.email);
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(Users, manager.create(Users, {
        email: dto.email, passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'teacher',
      }));
      const teacher = await manager.save(Teachers, manager.create(Teachers, {
        employeeCode: dto.employeeCode, specialization: dto.specialization, user: { id: user.id },
      }));
      return { ...teacher, user };
    });
  }

  async registerParent(dto: RegisterParentDto) {
    await this.checkEmail(dto.email);
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.save(Users, manager.create(Users, {
        email: dto.email, passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'parent',
      }));
      const parent = await manager.save(Parents, manager.create(Parents, {
        phoneSecondary: dto.phoneSecondary, emergencyContact: dto.emergencyContact,
        occupation: dto.occupation, user: { id: user.id },
      }));
      return { ...parent, user };
    });
  }

  async registerStudent(dto: RegisterStudentDto) {
    await this.checkEmail(dto.email);
    if (dto.parentId) {
      const parent = await this.findOneParent(dto.parentId);
    } else {
      if (!dto.parentEmail || !dto.parentPassword || !dto.parentFirstName || !dto.parentLastName) {
        throw new BadRequestException('parentEmail, parentPassword, parentFirstName y parentLastName son requeridos si no se proporciona parentId');
      }
      await this.checkEmail(dto.parentEmail);
    }
    return this.dataSource.transaction(async (manager) => {
      let parent: Parents;
      let parentUser: Users;
      if (dto.parentId) {
        const found = await manager.findOne(Parents, {
          where: { id: dto.parentId }, relations: { user: true },
        });
        if (!found) throw new NotFoundException(`Parent ${dto.parentId} no encontrado`);
        parent = found;
        parentUser = parent.user;
      } else {
        parentUser = await manager.save(Users, manager.create(Users, {
          email: dto.parentEmail, passwordHash: await this.hashPassword(dto.parentPassword!),
          firstName: dto.parentFirstName, lastName: dto.parentLastName,
          phone: dto.parentPhone ?? null, role: 'parent',
        }));
        parent = await manager.save(Parents, manager.create(Parents, {
          phoneSecondary: dto.parentPhoneSecondary,
          emergencyContact: dto.parentEmergencyContact,
          occupation: dto.parentOccupation, user: { id: parentUser.id },
        }));
      }
      const user = await manager.save(Users, manager.create(Users, {
        email: dto.email, passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone ?? null, role: 'student',
      }));
      const student = await manager.save(Students, manager.create(Students, {
        userId: user.id, parentId: parent.id, enrollmentNumber: dto.enrollmentNumber,
        birthDate: dto.birthDate, specialtyId: dto.specialtyId,
      }));
      return { ...student, user, parent: { ...parent, user: parentUser } };
    });
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
