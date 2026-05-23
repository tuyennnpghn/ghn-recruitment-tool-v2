"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineController = void 0;
const common_1 = require("@nestjs/common");
const pipeline_service_1 = require("./pipeline.service");
const match_candidate_dto_1 = require("./dto/match-candidate.dto");
const update_step_dto_1 = require("./dto/update-step.dto");
const move_stage_dto_1 = require("./dto/move-stage.dto");
const update_overall_status_dto_1 = require("./dto/update-overall-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PipelineController = class PipelineController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    match(dto, user) {
        return this.svc.match(dto, user.id);
    }
    getCandidatesForRequest(requestId) {
        return this.svc.getCandidatesForRequest(requestId);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    unmatch(id, user) {
        return this.svc.unmatch(id, user.id);
    }
    updateStep(id, stepNumber, dto, user) {
        return this.svc.updateStep(id, stepNumber, dto, user.id);
    }
    moveStage(id, dto, user) {
        return this.svc.moveStage(id, dto, user.id);
    }
    updateOverallStatus(id, dto, user) {
        return this.svc.updateOverallStatus(id, dto, user.id);
    }
};
exports.PipelineController = PipelineController;
__decorate([
    (0, common_1.Post)('match'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [match_candidate_dto_1.MatchCandidateDto, Object]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "match", null);
__decorate([
    (0, common_1.Get)('request/:requestId'),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "getCandidatesForRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "unmatch", null);
__decorate([
    (0, common_1.Patch)(':id/steps/:stepNumber'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('stepNumber', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, update_step_dto_1.UpdateStepDto, Object]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Post)(':id/move-stage'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, move_stage_dto_1.MoveStageDto, Object]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "moveStage", null);
__decorate([
    (0, common_1.Patch)(':id/overall-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_overall_status_dto_1.UpdateOverallStatusDto, Object]),
    __metadata("design:returntype", void 0)
], PipelineController.prototype, "updateOverallStatus", null);
exports.PipelineController = PipelineController = __decorate([
    (0, common_1.Controller)('pipeline'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pipeline_service_1.PipelineService])
], PipelineController);
//# sourceMappingURL=pipeline.controller.js.map