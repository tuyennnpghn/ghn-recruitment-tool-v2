"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    userSelect = {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
    };
    listUsers() {
        return this.prisma.user.findMany({
            select: this.userSelect,
            orderBy: { fullName: 'asc' },
        });
    }
    async createUser(data) {
        const hashed = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: { ...data, password: hashed },
            select: this.userSelect,
        });
    }
    updateUser(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: this.userSelect,
        });
    }
    async resetPassword(id, newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    }
    async deleteUser(id) {
        const record = await this.prisma.user.findUnique({
            where: { id },
            select: {
                _count: {
                    select: {
                        requestsCreated: true,
                        requestsAsRecruiter: true,
                        candidatesCreated: true,
                        candidatesAsPic: true,
                        matchedCandidates: true,
                    },
                },
            },
        });
        const hasRelations = Object.values(record?._count ?? {}).some((n) => n > 0);
        if (hasRelations) {
            await this.prisma.user.update({ where: { id }, data: { isActive: false } });
        }
        else {
            await this.prisma.user.delete({ where: { id } });
        }
    }
    async listActivityLogs(params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 50;
        const skip = (page - 1) * limit;
        const where = {
            ...(params.entityType && { entityType: params.entityType }),
            ...(params.userId && { userId: params.userId }),
            ...(params.action && { action: params.action }),
            ...((params.from || params.to) && {
                createdAt: {
                    ...(params.from && { gte: new Date(params.from) }),
                    ...(params.to && { lte: new Date(params.to) }),
                },
            }),
        };
        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                include: { user: { select: { id: true, fullName: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.activityLog.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    listCvSources() {
        return this.prisma.cvSource.findMany({ orderBy: { name: 'asc' } });
    }
    createCvSource(name) {
        return this.prisma.cvSource.create({ data: { name } });
    }
    updateCvSource(id, name) {
        return this.prisma.cvSource.update({ where: { id }, data: { name } });
    }
    deleteCvSource(id) {
        return this.prisma.cvSource.delete({ where: { id } });
    }
    listLevels() {
        return this.prisma.level.findMany({ orderBy: { name: 'asc' } });
    }
    createLevel(name, leadTimeDays) {
        return this.prisma.level.create({ data: { name, leadTimeDays: leadTimeDays ?? null } });
    }
    updateLevel(id, name, leadTimeDays) {
        return this.prisma.level.update({
            where: { id },
            data: { name, ...(leadTimeDays !== undefined && { leadTimeDays }) },
        });
    }
    deleteLevel(id) {
        return this.prisma.level.delete({ where: { id } });
    }
    listDepartments() {
        return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
    }
    createDepartment(code, name) {
        return this.prisma.department.create({ data: { code, name } });
    }
    updateDepartment(id, data) {
        return this.prisma.department.update({ where: { id }, data });
    }
    deleteDepartment(id) {
        return this.prisma.department.delete({ where: { id } });
    }
    listJobTitles(departmentId) {
        return this.prisma.jobTitle.findMany({
            where: departmentId ? { departmentId } : undefined,
            orderBy: [{ departmentId: 'asc' }, { title: 'asc' }],
            include: { department: { select: { id: true, name: true } } },
        });
    }
    createJobTitle(departmentId, title, sGrade) {
        return this.prisma.jobTitle.create({
            data: { departmentId, title, sGrade: sGrade ?? null },
            include: { department: { select: { id: true, name: true } } },
        });
    }
    updateJobTitle(id, data) {
        return this.prisma.jobTitle.update({
            where: { id },
            data,
            include: { department: { select: { id: true, name: true } } },
        });
    }
    deleteJobTitle(id) {
        return this.prisma.jobTitle.delete({ where: { id } });
    }
    listTracks() {
        return this.prisma.track.findMany({ orderBy: { name: 'asc' } });
    }
    createTrack(name) {
        return this.prisma.track.create({ data: { name } });
    }
    updateTrack(id, name) {
        return this.prisma.track.update({ where: { id }, data: { name } });
    }
    deleteTrack(id) {
        return this.prisma.track.delete({ where: { id } });
    }
    listSubTracks() {
        return this.prisma.subTrack.findMany({ orderBy: { name: 'asc' } });
    }
    createSubTrack(name) {
        return this.prisma.subTrack.create({ data: { name } });
    }
    updateSubTrack(id, name) {
        return this.prisma.subTrack.update({ where: { id }, data: { name } });
    }
    deleteSubTrack(id) {
        return this.prisma.subTrack.delete({ where: { id } });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map