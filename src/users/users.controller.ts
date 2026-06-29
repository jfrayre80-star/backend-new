import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teachers.dto';
import { CreateAdminDto, UpdateAdminDto } from './dto/admins.dto';
import { CreateParentDto, UpdateParentDto } from './dto/parents.dto';
import { CreateStudentDto, UpdateStudentDto } from './dto/students.dto';
import { RegisterAdminDto, RegisterTeacherDto, RegisterParentDto, RegisterStudentDto } from './dto/register.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Users ───
  @Get('users')
  findAllUsers() { return this.usersService.findAllUsers(); }

  @Get('users/:id')
  findOneUser(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneUser(id); }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) { return this.usersService.createUser(dto); }

  @Patch('users/:id')
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete('users/:id')
  removeUser(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeUser(id); }

  // ─── Register compuestos ───
  @Post('admins/register')
  registerAdmin(@Body() dto: RegisterAdminDto) { return this.usersService.registerAdmin(dto); }

  @Post('teachers/register')
  registerTeacher(@Body() dto: RegisterTeacherDto) { return this.usersService.registerTeacher(dto); }

  @Post('parents/register')
  registerParent(@Body() dto: RegisterParentDto) { return this.usersService.registerParent(dto); }

  @Post('students/register')
  registerStudent(@Body() dto: RegisterStudentDto) { return this.usersService.registerStudent(dto); }

  // ─── Teachers ───
  @Get('teachers')
  findAllTeachers() { return this.usersService.findAllTeachers(); }

  @Get('teachers/:id')
  findOneTeacher(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneTeacher(id); }

  @Post('teachers')
  createTeacher(@Body() dto: CreateTeacherDto) { return this.usersService.createTeacher(dto); }

  @Patch('teachers/:id')
  updateTeacher(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return this.usersService.updateTeacher(id, dto);
  }

  @Delete('teachers/:id')
  removeTeacher(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeTeacher(id); }

  // ─── Admins ───
  @Get('admins')
  findAllAdmins() { return this.usersService.findAllAdmins(); }

  @Get('admins/:id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneAdmin(id); }

  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto) { return this.usersService.createAdmin(dto); }

  @Patch('admins/:id')
  updateAdmin(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.usersService.updateAdmin(id, dto);
  }

  @Delete('admins/:id')
  removeAdmin(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeAdmin(id); }

  // ─── Parents ───
  @Get('parents')
  findAllParents() { return this.usersService.findAllParents(); }

  @Get('parents/:id')
  findOneParent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneParent(id); }

  @Post('parents')
  createParent(@Body() dto: CreateParentDto) { return this.usersService.createParent(dto); }

  @Patch('parents/:id')
  updateParent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateParentDto) {
    return this.usersService.updateParent(id, dto);
  }

  @Delete('parents/:id')
  removeParent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeParent(id); }

  // ─── Students ───
  @Get('students')
  findAllStudents() { return this.usersService.findAllStudents(); }

  @Get('students/:id')
  findOneStudent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneStudent(id); }

  @Post('students')
  createStudent(@Body() dto: CreateStudentDto) { return this.usersService.createStudent(dto); }

  @Patch('students/:id')
  updateStudent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    return this.usersService.updateStudent(id, dto);
  }

  @Delete('students/:id')
  removeStudent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeStudent(id); }
}
