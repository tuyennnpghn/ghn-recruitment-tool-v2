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
exports.CandidateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const path = __importStar(require("path"));
function normalizePhone(raw) {
    let p = raw.replace(/[\s\-\.]/g, '');
    if (p.startsWith('0'))
        p = '+84' + p.slice(1);
    else if (p.startsWith('84') && !p.startsWith('+'))
        p = '+' + p;
    else if (!p.startsWith('+84'))
        p = '+84' + p;
    return p;
}
const ALLOWED_MIME = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
let CandidateService = class CandidateService {
    prisma;
    supabase;
    constructor(prisma) {
        this.prisma = prisma;
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    get candidateSelect() {
        return {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            sGrade: true,
            currentCompany: true,
            industry: true,
            cvLink: true,
            isBlacklisted: true,
            blacklistReason: true,
            currentSalary: true,
            expectedSalary: true,
            salaryNote: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
            pic: { select: { id: true, fullName: true } },
            creator: { select: { id: true, fullName: true } },
            cvSource: { select: { id: true, name: true } },
            cvs: {
                orderBy: { versionNumber: 'desc' },
                select: {
                    id: true,
                    fileName: true,
                    filePath: true,
                    fileSizeBytes: true,
                    fileType: true,
                    versionNumber: true,
                    uploadedAt: true,
                    uploader: { select: { fullName: true } },
                },
            },
            _count: { select: { candidateRequests: true } },
            candidateRequests: {
                where: { isActive: true },
                select: { overallStatus: true },
            },
        };
    }
    async create(dto, userId) {
        if (!dto.email && !dto.phone) {
            throw new common_1.BadRequestException('Bắt buộc nhập ít nhất Email hoặc Số điện thoại');
        }
        const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
        const phone = dto.phone ? normalizePhone(dto.phone) : undefined;
        if (email) {
            const existing = await this.prisma.candidate.findUnique({
                where: { email },
            });
            if (existing)
                throw new common_1.ConflictException(`Email ${email} đã tồn tại trong hệ thống`);
        }
        if (phone) {
            const existing = await this.prisma.candidate.findUnique({
                where: { phone },
            });
            if (existing)
                throw new common_1.ConflictException(`Số điện thoại ${phone} đã tồn tại trong hệ thống`);
        }
        const candidate = await this.prisma.candidate.create({
            data: {
                fullName: dto.fullName,
                email,
                phone,
                picId: dto.picId,
                sGrade: dto.sGrade,
                currentCompany: dto.currentCompany,
                industry: dto.industry,
                cvLink: dto.cvLink,
                cvSourceId: dto.cvSourceId,
                isBlacklisted: dto.isBlacklisted ?? false,
                blacklistReason: dto.blacklistReason,
                currentSalary: dto.currentSalary,
                expectedSalary: dto.expectedSalary,
                salaryNote: dto.salaryNote,
                createdBy: userId,
            },
            select: this.candidateSelect,
        });
        await this.logActivity(candidate.id, userId, 'CREATE', null, {
            fullName: dto.fullName,
        });
        return candidate;
    }
    async findAll(dto, userRole) {
        const { search, picId, cvSourceId, isBlacklisted, includeArchived, page = 1, limit = 20, sortBy, sortOrder, } = dto;
        const where = {
            isArchived: includeArchived && userRole === 'admin' ? undefined : false,
        };
        if (isBlacklisted !== undefined)
            where.isBlacklisted = isBlacklisted;
        if (picId)
            where.picId = picId;
        if (cvSourceId)
            where.cvSourceId = cvSourceId;
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { currentCompany: { contains: search, mode: 'insensitive' } },
            ];
        }
        const orderBy = sortBy
            ? { [sortBy]: sortOrder ?? 'asc' }
            : { createdAt: 'desc' };
        const skip = (page - 1) * limit;
        const [candidates, total] = await Promise.all([
            this.prisma.candidate.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: this.candidateSelect,
            }),
            this.prisma.candidate.count({ where }),
        ]);
        return {
            items: candidates,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id, isArchived: false },
            select: {
                ...this.candidateSelect,
                candidateRequests: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        currentStep: true,
                        overallStatus: true,
                        matchedAt: true,
                        request: {
                            select: {
                                id: true,
                                requestNo: true,
                                status: true,
                                department: { select: { name: true } },
                                jobTitle: { select: { title: true } },
                            },
                        },
                        pipelineSteps: { orderBy: { stepNumber: 'asc' } },
                    },
                },
            },
        });
        if (!candidate)
            throw new common_1.NotFoundException('Ứng viên không tồn tại');
        return candidate;
    }
    async update(id, dto, userId) {
        const existing = await this.findOne(id);
        const logBefore = {};
        const logAfter = {};
        const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
        const phone = dto.phone ? normalizePhone(dto.phone) : undefined;
        if (email && email !== existing.email) {
            const dup = await this.prisma.candidate.findFirst({
                where: { email, NOT: { id } },
            });
            if (dup)
                throw new common_1.ConflictException(`Email ${email} đã tồn tại`);
            logBefore['Email'] = existing.email ?? '(trống)';
            logAfter['Email'] = email;
        }
        if (phone && phone !== existing.phone) {
            const dup = await this.prisma.candidate.findFirst({
                where: { phone, NOT: { id } },
            });
            if (dup)
                throw new common_1.ConflictException(`Số điện thoại ${phone} đã tồn tại`);
            logBefore['Số điện thoại'] = existing.phone ?? '(trống)';
            logAfter['Số điện thoại'] = phone;
        }
        const fieldMap = {
            fullName: 'Tên',
            sGrade: 'S-Grade',
            currentCompany: 'Công ty',
            industry: 'Ngành',
            cvLink: 'CV Link',
            isBlacklisted: 'Blacklist',
            blacklistReason: 'Lý do Blacklist',
        };
        for (const [key, label] of Object.entries(fieldMap)) {
            if (dto[key] !== undefined &&
                dto[key] !== existing[key]) {
                logBefore[label] = existing[key] ?? '(trống)';
                logAfter[label] = dto[key];
            }
        }
        const updated = await this.prisma.candidate.update({
            where: { id },
            data: {
                ...(dto.fullName && { fullName: dto.fullName }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(dto.picId && { picId: dto.picId }),
                ...(dto.sGrade !== undefined && { sGrade: dto.sGrade }),
                ...(dto.currentCompany !== undefined && {
                    currentCompany: dto.currentCompany,
                }),
                ...(dto.industry !== undefined && { industry: dto.industry }),
                ...(dto.cvLink !== undefined && { cvLink: dto.cvLink }),
                ...(dto.cvSourceId !== undefined && { cvSourceId: dto.cvSourceId }),
                ...(dto.isBlacklisted !== undefined && {
                    isBlacklisted: dto.isBlacklisted,
                }),
                ...(dto.blacklistReason !== undefined && {
                    blacklistReason: dto.blacklistReason,
                }),
                ...(dto.currentSalary !== undefined && {
                    currentSalary: dto.currentSalary,
                }),
                ...(dto.expectedSalary !== undefined && {
                    expectedSalary: dto.expectedSalary,
                }),
                ...(dto.salaryNote !== undefined && { salaryNote: dto.salaryNote }),
            },
            select: this.candidateSelect,
        });
        if (Object.keys(logAfter).length > 0) {
            await this.logActivity(id, userId, 'UPDATE', logBefore, logAfter);
        }
        return updated;
    }
    async uploadCv(candidateId, file, userId) {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Chỉ chấp nhận file PDF hoặc DOCX');
        }
        if (file.size > MAX_FILE_BYTES) {
            throw new common_1.BadRequestException('File quá lớn — tối đa 10MB');
        }
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: candidateId },
        });
        if (!candidate)
            throw new common_1.NotFoundException('Ứng viên không tồn tại');
        const lastCv = await this.prisma.candidateCv.findFirst({
            where: { candidateId },
            orderBy: { versionNumber: 'desc' },
        });
        const versionNumber = (lastCv?.versionNumber ?? 0) + 1;
        const ext = path.extname(file.originalname).toLowerCase();
        const filePath = `cvs/${candidateId}/v${versionNumber}_${Date.now()}${ext}`;
        const { error } = await this.supabase.storage
            .from(process.env.SUPABASE_CV_BUCKET)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            throw new common_1.BadRequestException(`Upload thất bại: ${error.message}`);
        }
        const cv = await this.prisma.candidateCv.create({
            data: {
                candidateId,
                filePath,
                fileName: file.originalname,
                fileSizeBytes: file.size,
                fileType: file.mimetype,
                versionNumber,
                uploadedBy: userId,
            },
        });
        await this.logActivity(candidateId, userId, 'UPDATE', null, {
            'CV Upload': `v${versionNumber} — ${file.originalname}`,
        });
        return { ...cv, signedUrl: await this.getSignedUrl(filePath) };
    }
    async getCvSignedUrl(cvId) {
        const cv = await this.prisma.candidateCv.findUnique({
            where: { id: cvId },
        });
        if (!cv)
            throw new common_1.NotFoundException('CV không tồn tại');
        const signedUrl = await this.getSignedUrl(cv.filePath);
        return { signedUrl, fileName: cv.fileName };
    }
    async getSignedUrl(filePath) {
        const { data, error } = await this.supabase.storage
            .from(process.env.SUPABASE_CV_BUCKET)
            .createSignedUrl(filePath, 60 * 60);
        if (error)
            throw new common_1.BadRequestException(`Không tạo được signed URL: ${error.message}`);
        return data.signedUrl;
    }
    async archive(id, userId) {
        await this.prisma.candidate.update({
            where: { id },
            data: { isArchived: true },
        });
        await this.logActivity(id, userId, 'ARCHIVE', { isArchived: false }, { isArchived: true });
        return { message: 'Đã archive ứng viên' };
    }
    async restore(id, userId) {
        await this.prisma.candidate.update({
            where: { id },
            data: { isArchived: false },
        });
        await this.logActivity(id, userId, 'RESTORE', { isArchived: true }, { isArchived: false });
        return { message: 'Đã restore ứng viên' };
    }
    async getActivityLog(candidateId) {
        return this.prisma.activityLog.findMany({
            where: { entityType: 'Candidate', entityId: candidateId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true } } },
        });
    }
    async logActivity(entityId, userId, action, before, after) {
        await this.prisma.activityLog.create({
            data: {
                entityType: 'Candidate',
                entityId,
                userId,
                action,
                changesJson: { before, after },
            },
        });
    }
    async getCvSources() {
        return this.prisma.cvSource.findMany({ orderBy: { name: 'asc' } });
    }
};
exports.CandidateService = CandidateService;
exports.CandidateService = CandidateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CandidateService);
//# sourceMappingURL=candidate.service.js.map