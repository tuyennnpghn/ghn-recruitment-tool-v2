import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CloseRequestDto } from './dto/close-request.dto';
import {
  PendingRequestDto,
  AcceptedOfferDto,
} from './dto/transition-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestController {
  constructor(private requestService: RequestService) {}

  // ----------------------------------------------------------------
  // Master data for dropdowns (FE form)
  // ----------------------------------------------------------------
  @Get('meta/departments')
  getDepartments() {
    return this.requestService.getDepartments();
  }

  @Get('meta/departments/:id/job-titles')
  getJobTitles(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.getJobTitlesByDepartment(id);
  }

  @Get('meta/levels')
  getLevels() {
    return this.requestService.getLevels();
  }

  @Get('meta/tracks')
  getTracks() {
    return this.requestService.getTracks();
  }

  @Get('meta/sub-tracks')
  getSubTracks() {
    return this.requestService.getSubTracks();
  }

  @Get('meta/users')
  getUsers() {
    return this.requestService.getUsers();
  }

  // ----------------------------------------------------------------
  // CRUD
  // ----------------------------------------------------------------
  @Post()
  create(@Body() dto: CreateRequestDto, @CurrentUser() user: { id: string }) {
    return this.requestService.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query() dto: ListRequestsDto,
    @CurrentUser() user: { role: string },
  ) {
    return this.requestService.findAll(dto, user.role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.update(id, dto, user.id);
  }

  // ----------------------------------------------------------------
  // Status transitions
  // ----------------------------------------------------------------
  @Post(':id/pending')
  @HttpCode(HttpStatus.OK)
  setPending(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PendingRequestDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.setPending(id, dto, user.id);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  resume(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.resume(id, user.id);
  }

  @Post(':id/accepted-offer')
  @HttpCode(HttpStatus.OK)
  setAcceptedOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptedOfferDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.setAcceptedOffer(id, dto, user.id);
  }

  @Post(':id/done')
  @HttpCode(HttpStatus.OK)
  setDone(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.setDone(id, user.id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseRequestDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.closeRequest(id, dto, user.id);
  }

  // ----------------------------------------------------------------
  // Archive / Restore (admin only)
  // ----------------------------------------------------------------
  @Post(':id/archive')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.archive(id, user.id);
  }

  @Post(':id/restore')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.requestService.restore(id, user.id);
  }

  // ----------------------------------------------------------------
  // Funnel report
  // ----------------------------------------------------------------
  @Get(':id/funnel')
  getFunnelReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.getFunnelReport(id);
  }

  // ----------------------------------------------------------------
  // Activity log
  // ----------------------------------------------------------------
  @Get(':id/activity-log')
  getActivityLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.getActivityLog(id);
  }
}
