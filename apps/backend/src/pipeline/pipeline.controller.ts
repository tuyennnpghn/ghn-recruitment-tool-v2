import {
  Controller,
  Post,
  Delete,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { MatchCandidateDto } from './dto/match-candidate.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { MoveStageDto } from './dto/move-stage.dto';
import { UpdateOverallStatusDto } from './dto/update-overall-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pipeline')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private readonly svc: PipelineService) {}

  // POST /pipeline/match
  @Post('match')
  match(@Body() dto: MatchCandidateDto, @CurrentUser() user: any) {
    return this.svc.match(dto, user.id);
  }

  // GET /pipeline/request/:requestId — get all candidates for a request
  @Get('request/:requestId')
  getCandidatesForRequest(
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ) {
    return this.svc.getCandidatesForRequest(requestId);
  }

  // GET /pipeline/:id — get one CandidateRequest
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  // DELETE /pipeline/:id — unmatch
  @Delete(':id')
  unmatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.unmatch(id, user.id);
  }

  // PATCH /pipeline/:id/steps/:stepNumber
  @Patch(':id/steps/:stepNumber')
  updateStep(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Body() dto: UpdateStepDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateStep(id, stepNumber, dto, user.id);
  }

  // POST /pipeline/:id/move-stage
  @Post(':id/move-stage')
  moveStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveStageDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.moveStage(id, dto, user.id);
  }

  // PATCH /pipeline/:id/overall-status
  @Patch(':id/overall-status')
  updateOverallStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOverallStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateOverallStatus(id, dto, user.id);
  }
}
