import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(private readonly svc: CandidateService) {}

  // ── Meta ──────────────────────────────────────────────────────
  @Get('meta/cv-sources')
  getCvSources() {
    return this.svc.getCvSources();
  }

  // ── CRUD ──────────────────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateCandidateDto, @CurrentUser() user: any) {
    return this.svc.create(dto, user.id);
  }

  @Get()
  findAll(@Query() dto: ListCandidatesDto, @CurrentUser() user: any) {
    return this.svc.findAll(dto, user.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandidateDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.update(id, dto, user.id);
  }

  // ── CV Upload ─────────────────────────────────────────────────
  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadCv(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.svc.uploadCv(id, file, user.id);
  }

  @Get('cv/:cvId/signed-url')
  getCvSignedUrl(@Param('cvId', ParseUUIDPipe) cvId: string) {
    return this.svc.getCvSignedUrl(cvId);
  }

  // ── Activity Log ──────────────────────────────────────────────
  @Get(':id/activity-log')
  getActivityLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getActivityLog(id);
  }

  // ── Archive / Restore (admin only) ───────────────────────────
  @Post(':id/archive')
  @UseGuards(RolesGuard)
  @Roles('admin')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.svc.archive(id, user.id);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles('admin')
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.svc.restore(id, user.id);
  }
}
