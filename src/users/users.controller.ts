import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UpdateTeacherDto } from './dto/teachers.dto';
import { UpdateAdminDto } from './dto/admins.dto';
import { UpdateParentDto } from './dto/parents.dto';
import { UpdateStudentDto } from './dto/students.dto';
import { RegisterAdminDto, RegisterTeacherDto, RegisterParentDto, RegisterStudentDto } from './dto/register.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Users ───
  @Roles('admin')
  @Get('users')
  findAllUsers(@Query('role') role?: string, @Query('isActive') isActive?: string) {
    return this.usersService.findAllUsers(role, isActive);
  }

  @Roles('admin')
  @Get('users/:id')
  findOneUser(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneUser(id); }

  @Roles('admin')
  @Post('users')
  createUser(@Body() dto: CreateUserDto) { return this.usersService.createUser(dto); }

  @Roles('admin')
  @Patch('users/:id')
  updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Roles('admin')
  @Delete('users/:id')
  removeUser(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeUser(id); }

  // ─── Register compuestos ───
  @Roles('admin')
  @Post('admins/register')
  registerAdmin(@Body() dto: RegisterAdminDto) { return this.usersService.registerAdmin(dto); }

  @Roles('admin')
  @Post('teachers/register')
  registerTeacher(@Body() dto: RegisterTeacherDto) { return this.usersService.registerTeacher(dto); }

  @Roles('admin')
  @Post('parents/register')
  registerParent(@Body() dto: RegisterParentDto) { return this.usersService.registerParent(dto); }

  @Roles('admin')
  @Post('students/register')
  registerStudent(@Body() dto: RegisterStudentDto) { return this.usersService.registerStudent(dto); }

  // ─── Teachers ───
  @Roles('admin')
  @Get('teachers')
  findAllTeachers() { return this.usersService.findAllTeachers(); }

  @Roles('admin')
  @Get('teachers/:id')
  findOneTeacher(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneTeacher(id); }

  @Roles('admin')
  @Patch('teachers/:id')
  updateTeacher(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return this.usersService.updateTeacher(id, dto);
  }

  @Roles('admin')
  @Delete('teachers/:id')
  removeTeacher(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeTeacher(id); }

  // ─── Admins ───
  @Roles('admin')
  @Get('admins')
  findAllAdmins() { return this.usersService.findAllAdmins(); }

  @Roles('admin')
  @Get('admins/:id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneAdmin(id); }

  @Roles('admin')
  @Patch('admins/:id')
  updateAdmin(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.usersService.updateAdmin(id, dto);
  }

  @Roles('admin')
  @Delete('admins/:id')
  removeAdmin(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeAdmin(id); }

  // ─── Parents ───
  @Roles('admin')
  @Get('parents')
  findAllParents() { return this.usersService.findAllParents(); }

  @Roles('admin')
  @Get('parents/:id')
  findOneParent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneParent(id); }

  @Roles('admin')
  @Patch('parents/:id')
  updateParent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateParentDto) {
    return this.usersService.updateParent(id, dto);
  }

  @Roles('admin')
  @Delete('parents/:id')
  removeParent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeParent(id); }

  // ─── Students ───
  @Roles('admin')
  @Get('students')
  findAllStudents() { return this.usersService.findAllStudents(); }

  @Roles('admin')
  @Get('students/:id')
  findOneStudent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.findOneStudent(id); }

  @Roles('admin')
  @Patch('students/:id')
  updateStudent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto) {
    return this.usersService.updateStudent(id, dto);
  }

  @Roles('admin')
  @Delete('students/:id')
  removeStudent(@Param('id', ParseUUIDPipe) id: string) { return this.usersService.removeStudent(id); }
}
