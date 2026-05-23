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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseRequestDto = void 0;
const class_validator_1 = require("class-validator");
class CloseRequestDto {
    closeReason;
}
exports.CloseRequestDto = CloseRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Lý do close không được để trống' }),
    (0, class_validator_1.MinLength)(3, { message: 'Lý do close phải có ít nhất 3 ký tự' }),
    __metadata("design:type", String)
], CloseRequestDto.prototype, "closeReason", void 0);
//# sourceMappingURL=close-request.dto.js.map