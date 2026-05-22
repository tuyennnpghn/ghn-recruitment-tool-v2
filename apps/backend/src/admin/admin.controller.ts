import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Activity Log ──────────────────────────────────────────────────────────

  @Get('audit')
  listActivityLogs(
    @Query('page')       page?: string,
    @Query('limit')      limit?: string,
    @Query('entityType') entityType?: string,
    @Query('userId')     userId?: string,
    @Query('action')     action?: string,
    @Query('from')       from?: string,
    @Query('to')         to?: string,
  ) {
    return this.adminService.listActivityLogs({
      page:  page  ? Number(page)  : undefined,
      limit: limit ? Number(limit) : undefined,
      entityType,
      userId,
      action,
      from,
      to,
    });
  }

  // ─── User ──────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users')
  createUser(
    @Body() body: { email: string; fullName: string; password: string; role: string },
  ) {
    return this.adminService.createUser(body);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { fullName?: string; email?: string; role?: string; isActive?: boolean },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.adminService.resetPassword(id, body.newPassword);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  // ─── CvSource ──────────────────────────────────────────────────────────────

  @Get('cv-sources')
  listCvSources() {
    return this.adminService.listCvSources();
  }

  @Post('cv-sources')
  createCvSource(@Body() body: { name: string }) {
    return this.adminService.createCvSource(body.name);
  }

  @Patch('cv-sources/:id')
  updateCvSource(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string },
  ) {
    return this.adminService.updateCvSource(id, body.name);
  }

  @Delete('cv-sources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCvSource(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCvSource(id);
  }

  // ─── Level ─────────────────────────────────────────────────────────────────

  @Get('levels')
  listLevels() {
    return this.adminService.listLevels();
  }

  @Post('levels')
  createLevel(@Body() body: { name: string; leadTimeDays?: number | null }) {
    return this.adminService.createLevel(body.name, body.leadTimeDays);
  }

  @Patch('levels/:id')
  updateLevel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string; leadTimeDays?: number | null },
  ) {
    return this.adminService.updateLevel(id, body.name, body.leadTimeDays);
  }

  @Delete('levels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLevel(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteLevel(id);
  }

  // ─── Department ────────────────────────────────────────────────────────────

  @Get('departments')
  listDepartments() {
    return this.adminService.listDepartments();
  }

  @Post('departments')
  createDepartment(@Body() body: { code: string; name: string }) {
    return this.adminService.createDepartment(body.code, body.name);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { code?: string; name?: string },
  ) {
    return this.adminService.updateDepartment(id, body);
  }

  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteDepartment(id);
  }

  // ─── JobTitle ──────────────────────────────────────────────────────────────

  @Get('job-titles')
  listJobTitles(@Query('departmentId') departmentId?: string) {
    return this.adminService.listJobTitles(departmentId);
  }

  @Post('job-titles')
  createJobTitle(
    @Body() body: { departmentId: string; title: string; sGrade?: string | null },
  ) {
    return this.adminService.createJobTitle(body.departmentId, body.title, body.sGrade);
  }

  @Patch('job-titles/:id')
  updateJobTitle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { title?: string; sGrade?: string | null },
  ) {
    return this.adminService.updateJobTitle(id, body);
  }

  @Delete('job-titles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteJobTitle(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteJobTitle(id);
  }

  // ─── Track ─────────────────────────────────────────────────────────────────

  @Get('tracks')
  listTracks() {
    return this.adminService.listTracks();
  }

  @Post('tracks')
  createTrack(@Body() body: { name: string }) {
    return this.adminService.createTrack(body.name);
  }

  @Patch('tracks/:id')
  updateTrack(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string },
  ) {
    return this.adminService.updateTrack(id, body.name);
  }

  @Delete('tracks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTrack(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteTrack(id);
  }

  // ─── SubTrack ──────────────────────────────────────────────────────────────

  @Get('sub-tracks')
  listSubTracks() {
    return this.adminService.listSubTracks();
  }

  @Post('sub-tracks')
  createSubTrack(@Body() body: { name: string }) {
    return this.adminService.createSubTrack(body.name);
  }

  @Patch('sub-tracks/:id')
  updateSubTrack(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string },
  ) {
    return this.adminService.updateSubTrack(id, body.name);
  }

  @Delete('sub-tracks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSubTrack(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteSubTrack(id);
  }
}
