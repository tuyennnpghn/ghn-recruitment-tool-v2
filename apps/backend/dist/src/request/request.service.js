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
exports.RequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const funnel_helper_1 = require("./funnel.helper");
const VALID_TRANSITIONS = {
    Opening: ['Pending', 'Accepted offer', 'Close'],
    Pending: ['Opening', 'Close'],
    'Accepted offer': ['Done', 'Close'],
    Done: [],
    Close: [],
};
function vnMidnight(d) {
    const src = d ?? new Date();
    const vn = new Date(src.getTime() + 7 * 60 * 60 * 1000);
    return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}
let RequestService = class RequestService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateLeadTime(request) {
        if (!request.level || request.level.leadTimeDays === null) {
            return {
                actualLeadTimeDays: null,
                leadTimeStatus: 'N/A',
                standardLeadTimeDays: null,
            };
        }
        const standardDays = request.level.leadTimeDays;
        const openDate = new Date(request.openDate);
        const today = new Date();
        let referenceDate;
        if (request.cddAcceptedOfferDate) {
            referenceDate = new Date(request.cddAcceptedOfferDate);
        }
        else {
            referenceDate = today;
        }
        const holidays = await this.prisma.holidayCalendar.findMany({
            where: {
                holidayDate: {
                    gte: openDate,
                    lte: referenceDate,
                },
            },
        });
        const holidayDays = holidays.length;
        const calendarDays = Math.floor((referenceDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
        const pendingDays = request.pendingDays ?? 0;
        const actualLeadTimeDays = Math.max(0, calendarDays - pendingDays - holidayDays);
        const leadTimeStatus = actualLeadTimeDays <= standardDays ? 'Within leadtime' : 'Over leadtime';
        return {
            actualLeadTimeDays,
            leadTimeStatus,
            standardLeadTimeDays: standardDays,
        };
    }
    async generateRequestNo(departmentId, year) {
        const dept = await this.prisma.department.findUnique({
            where: { id: departmentId },
        });
        if (!dept)
            throw new common_1.NotFoundException('Phòng ban không tồn tại');
        const yy = String(year).slice(-2);
        const counter = await this.prisma.requestNoCounter.upsert({
            where: { departmentId_year: { departmentId, year } },
            create: { departmentId, year, lastSequence: 1 },
            update: { lastSequence: { increment: 1 } },
        });
        const seq = String(counter.lastSequence).padStart(4, '0');
        const requestNo = `${yy}_${dept.code}_${seq}`;
        return { requestNo, codeDept: dept.code };
    }
    async lookupSGrade(departmentId, jobTitleId) {
        const jobTitle = await this.prisma.jobTitle.findFirst({
            where: { id: jobTitleId, departmentId },
        });
        return jobTitle?.sGrade ?? null;
    }
    get requestSelect() {
        return {
            id: true,
            requestNo: true,
            codeDept: true,
            openDate: true,
            status: true,
            section: true,
            team: true,
            hiringManager: true,
            typeOfRecruitment: true,
            replaceFor: true,
            cddAcceptedOfferDate: true,
            onboardDate: true,
            pendingStartDate: true,
            pendingEndDate: true,
            pendingDays: true,
            pendingReason: true,
            closeReason: true,
            note: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
            department: { select: { id: true, name: true, code: true } },
            jobTitle: { select: { id: true, title: true, sGrade: true } },
            level: { select: { id: true, name: true, leadTimeDays: true } },
            track: { select: { id: true, name: true } },
            subTrack: { select: { id: true, name: true } },
            recruiter: { select: { id: true, fullName: true, email: true } },
            shared1: { select: { id: true, fullName: true } },
            shared2: { select: { id: true, fullName: true } },
            shared3: { select: { id: true, fullName: true } },
            creator: { select: { id: true, fullName: true } },
            sGrade: true,
            shared1Date: true,
            shared2Date: true,
            shared3Date: true,
            _count: { select: { candidateRequests: true } },
        };
    }
    async create(dto, userId) {
        const openDate = new Date(dto.openDate);
        const year = openDate.getFullYear();
        const { requestNo, codeDept } = await this.generateRequestNo(dto.departmentId, year);
        let sGrade = null;
        if (dto.jobTitleId) {
            sGrade = await this.lookupSGrade(dto.departmentId, dto.jobTitleId);
        }
        const request = await this.prisma.request.create({
            data: {
                requestNo,
                codeDept,
                openDate,
                departmentId: dto.departmentId,
                section: dto.section,
                team: dto.team,
                jobTitleId: dto.jobTitleId,
                levelId: dto.levelId,
                sGrade,
                trackId: dto.trackId,
                subTrackId: dto.subTrackId,
                hiringManager: dto.hiringManager,
                recruiterId: dto.recruiterId,
                shared1Id: dto.shared1Id,
                shared1Date: dto.shared1Date ? new Date(dto.shared1Date) : undefined,
                shared2Id: dto.shared2Id,
                shared2Date: dto.shared2Date ? new Date(dto.shared2Date) : undefined,
                shared3Id: dto.shared3Id,
                shared3Date: dto.shared3Date ? new Date(dto.shared3Date) : undefined,
                typeOfRecruitment: dto.typeOfRecruitment,
                replaceFor: dto.replaceFor,
                note: dto.note,
                status: 'Opening',
                createdBy: userId,
            },
            select: this.requestSelect,
        });
        await this.logActivity(request.id, userId, 'CREATE', null, {
            status: 'Opening',
        });
        const leadTime = await this.calculateLeadTime(request);
        return { ...request, ...leadTime };
    }
    async findAll(dto, userRole) {
        const { status, departmentId, recruiterId, month, search, sortBy, sortOrder, page, limit, includeArchived, } = dto;
        const skip = ((page ?? 1) - 1) * (limit ?? 20);
        const take = limit ?? 20;
        const where = {
            isArchived: includeArchived && userRole === 'admin' ? undefined : false,
        };
        if (status)
            where.status = status;
        if (departmentId)
            where.departmentId = departmentId;
        if (recruiterId)
            where.recruiterId = recruiterId;
        if (month) {
            const [y, m] = month.split('-').map(Number);
            const start = new Date(y, m - 1, 1);
            const end = new Date(y, m, 0, 23, 59, 59);
            where.openDate = { gte: start, lte: end };
        }
        if (search) {
            where.OR = [
                { requestNo: { contains: search, mode: 'insensitive' } },
                { jobTitle: { title: { contains: search, mode: 'insensitive' } } },
                { department: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const orderBy = sortBy
            ? { [sortBy]: sortOrder ?? 'asc' }
            : { createdAt: 'desc' };
        const [requests, total] = await Promise.all([
            this.prisma.request.findMany({
                where,
                skip,
                take,
                orderBy,
                select: this.requestSelect,
            }),
            this.prisma.request.count({ where }),
        ]);
        const statusCounts = requests.length > 0
            ? await this.prisma.candidateRequest.groupBy({
                by: ['requestId', 'overallStatus'],
                where: {
                    requestId: { in: requests.map((r) => r.id) },
                    overallStatus: { in: ['Offer', 'Onboarded'] },
                },
                _count: { id: true },
            })
            : [];
        const offerMap = {};
        const onboardMap = {};
        for (const row of statusCounts) {
            if (row.overallStatus === 'Offer')
                offerMap[row.requestId] = row._count.id;
            if (row.overallStatus === 'Onboarded')
                onboardMap[row.requestId] = row._count.id;
        }
        const items = await Promise.all(requests.map(async (r) => {
            const lt = await this.calculateLeadTime(r);
            return { ...r, ...lt, offeredCount: offerMap[r.id] ?? 0, onboardedCount: onboardMap[r.id] ?? 0 };
        }));
        return {
            items,
            meta: {
                total,
                page: page ?? 1,
                limit: take,
                totalPages: Math.ceil(total / take),
            },
        };
    }
    async findOne(id) {
        const request = await this.prisma.request.findFirst({
            where: { id, isArchived: false },
            select: this.requestSelect,
        });
        if (!request)
            throw new common_1.NotFoundException('Request không tồn tại');
        const lt = await this.calculateLeadTime(request);
        return { ...request, ...lt };
    }
    async update(id, dto, userId) {
        const existing = await this.findOne(id);
        if (existing.status === 'Close' || existing.status === 'Done') {
            throw new common_1.BadRequestException(`Không thể chỉnh sửa request ở trạng thái ${existing.status}`);
        }
        let sGrade = existing.sGrade;
        const deptId = existing.department?.id;
        let newJobTitle = null;
        let newLevel = null;
        let newRecruiter = null;
        if (dto.jobTitleId && deptId) {
            newJobTitle = await this.prisma.jobTitle.findFirst({
                where: { id: dto.jobTitleId },
            });
            sGrade = await this.lookupSGrade(deptId, dto.jobTitleId);
        }
        if (dto.levelId) {
            newLevel = await this.prisma.level.findUnique({
                where: { id: dto.levelId },
            });
        }
        if (dto.recruiterId) {
            newRecruiter = await this.prisma.user.findUnique({
                where: { id: dto.recruiterId },
                select: { fullName: true },
            });
        }
        const logBefore = {};
        const logAfter = {};
        if (dto.jobTitleId !== undefined &&
            dto.jobTitleId !== existing.jobTitle?.id) {
            logBefore['Job Title'] = existing.jobTitle?.title ?? '(trống)';
            logAfter['Job Title'] = newJobTitle?.title ?? dto.jobTitleId;
            const oldSGrade = existing.sGrade;
            if (oldSGrade !== sGrade) {
                logBefore['S-Grade'] = oldSGrade ?? '(trống)';
                logAfter['S-Grade'] = sGrade ?? '(trống)';
            }
        }
        if (dto.levelId !== undefined &&
            dto.levelId !== existing.level?.id) {
            logBefore['Level'] = existing.level?.name ?? '(trống)';
            logAfter['Level'] = newLevel?.name ?? dto.levelId;
        }
        if (dto.recruiterId &&
            dto.recruiterId !== existing.recruiter?.id) {
            logBefore['Recruiter'] =
                existing.recruiter?.fullName ?? '(trống)';
            logAfter['Recruiter'] = newRecruiter?.fullName ?? dto.recruiterId;
        }
        if (dto.hiringManager !== undefined &&
            dto.hiringManager !== existing.hiringManager) {
            logBefore['Hiring Manager'] =
                existing.hiringManager ?? '(trống)';
            logAfter['Hiring Manager'] = dto.hiringManager;
        }
        if (dto.note !== undefined && dto.note !== existing.note) {
            logBefore['Ghi chú'] = existing.note ?? '(trống)';
            logAfter['Ghi chú'] = dto.note;
        }
        if (dto.trackId !== undefined &&
            dto.trackId !== existing.track?.id) {
            const newTrack = dto.trackId
                ? await this.prisma.track.findUnique({ where: { id: dto.trackId } })
                : null;
            logBefore['Track'] = existing.track?.name ?? '(trống)';
            logAfter['Track'] = newTrack?.name ?? '(trống)';
        }
        const updated = await this.prisma.request.update({
            where: { id },
            data: {
                ...(dto.openDate && { openDate: new Date(dto.openDate) }),
                ...(dto.jobTitleId !== undefined && { jobTitleId: dto.jobTitleId }),
                ...(dto.levelId !== undefined && { levelId: dto.levelId }),
                ...(dto.section !== undefined && { section: dto.section }),
                ...(dto.team !== undefined && { team: dto.team }),
                ...(dto.trackId !== undefined && { trackId: dto.trackId }),
                ...(dto.subTrackId !== undefined && { subTrackId: dto.subTrackId }),
                ...(dto.hiringManager !== undefined && {
                    hiringManager: dto.hiringManager,
                }),
                ...(dto.recruiterId && { recruiterId: dto.recruiterId }),
                ...(dto.shared1Id !== undefined && { shared1Id: dto.shared1Id }),
                ...(dto.shared1Date !== undefined && {
                    shared1Date: dto.shared1Date ? new Date(dto.shared1Date) : null,
                }),
                ...(dto.shared2Id !== undefined && { shared2Id: dto.shared2Id }),
                ...(dto.shared2Date !== undefined && {
                    shared2Date: dto.shared2Date ? new Date(dto.shared2Date) : null,
                }),
                ...(dto.shared3Id !== undefined && { shared3Id: dto.shared3Id }),
                ...(dto.shared3Date !== undefined && {
                    shared3Date: dto.shared3Date ? new Date(dto.shared3Date) : null,
                }),
                ...(dto.typeOfRecruitment && {
                    typeOfRecruitment: dto.typeOfRecruitment,
                }),
                ...(dto.replaceFor !== undefined && { replaceFor: dto.replaceFor }),
                ...(dto.cddAcceptedOfferDate !== undefined && {
                    cddAcceptedOfferDate: dto.cddAcceptedOfferDate
                        ? new Date(dto.cddAcceptedOfferDate)
                        : null,
                }),
                ...(dto.onboardDate !== undefined && {
                    onboardDate: dto.onboardDate ? new Date(dto.onboardDate) : null,
                }),
                ...(dto.note !== undefined && { note: dto.note }),
                sGrade,
            },
            select: this.requestSelect,
        });
        if (Object.keys(logAfter).length > 0) {
            await this.logActivity(id, userId, 'UPDATE', logBefore, logAfter);
        }
        const lt = await this.calculateLeadTime(updated);
        return { ...updated, ...lt };
    }
    validateTransition(fromStatus, toStatus) {
        const allowed = VALID_TRANSITIONS[fromStatus] ?? [];
        if (!allowed.includes(toStatus)) {
            throw new common_1.BadRequestException(`Không thể chuyển từ "${fromStatus}" sang "${toStatus}"`);
        }
    }
    async setPending(id, dto, userId) {
        const req = await this.findOne(id);
        this.validateTransition(req.status, 'Pending');
        const updated = await this.prisma.request.update({
            where: { id },
            data: {
                status: 'Pending',
                pendingStartDate: vnMidnight(),
                pendingReason: dto.pendingReason,
                pendingEndDate: null,
            },
            select: this.requestSelect,
        });
        await this.logActivity(id, userId, 'UPDATE', { status: req.status }, { status: 'Pending', pendingReason: dto.pendingReason });
        return updated;
    }
    async resume(id, userId) {
        const req = await this.findOne(id);
        this.validateTransition(req.status, 'Opening');
        if (req.status !== 'Pending') {
            throw new common_1.BadRequestException('Chỉ có thể Resume khi request đang ở trạng thái Pending');
        }
        const endDate = vnMidnight();
        const startDate = req.pendingStartDate
            ? vnMidnight(new Date(req.pendingStartDate))
            : endDate;
        const pendingDaysDelta = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPendingDays = (req.pendingDays ?? 0) + Math.max(0, pendingDaysDelta);
        const updated = await this.prisma.request.update({
            where: { id },
            data: {
                status: 'Opening',
                pendingEndDate: endDate,
                pendingDays: totalPendingDays,
            },
            select: this.requestSelect,
        });
        await this.logActivity(id, userId, 'UPDATE', { status: 'Pending' }, { status: 'Opening', pendingDays: totalPendingDays });
        return updated;
    }
    async setAcceptedOffer(id, dto, userId) {
        const req = await this.findOne(id);
        this.validateTransition(req.status, 'Accepted offer');
        const updated = await this.prisma.request.update({
            where: { id },
            data: {
                status: 'Accepted offer',
                cddAcceptedOfferDate: new Date(dto.cddAcceptedOfferDate),
                onboardDate: dto.onboardDate ? new Date(dto.onboardDate) : undefined,
            },
            select: this.requestSelect,
        });
        await this.logActivity(id, userId, 'UPDATE', { status: req.status }, {
            status: 'Accepted offer',
            cddAcceptedOfferDate: dto.cddAcceptedOfferDate,
        });
        const lt = await this.calculateLeadTime(updated);
        return { ...updated, ...lt };
    }
    async setDone(id, userId) {
        const req = await this.findOne(id);
        this.validateTransition(req.status, 'Done');
        const updated = await this.prisma.request.update({
            where: { id },
            data: { status: 'Done' },
            select: this.requestSelect,
        });
        await this.logActivity(id, userId, 'UPDATE', { status: req.status }, { status: 'Done' });
        return updated;
    }
    async closeRequest(id, dto, userId) {
        const req = await this.findOne(id);
        this.validateTransition(req.status, 'Close');
        const activeCount = await this.prisma.candidateRequest.count({
            where: { requestId: id, isActive: true },
        });
        if (activeCount > 0) {
            throw new common_1.BadRequestException(`Không thể close request khi còn ${activeCount} ứng viên chưa đóng. Vui lòng đóng tất cả ứng viên trước.`);
        }
        const updated = await this.prisma.request.update({
            where: { id },
            data: { status: 'Close', closeReason: dto.closeReason },
            select: this.requestSelect,
        });
        await this.logActivity(id, userId, 'UPDATE', { status: req.status }, { status: 'Close', closeReason: dto.closeReason });
        return updated;
    }
    async archive(id, userId) {
        const req = await this.findOne(id);
        await this.prisma.request.update({
            where: { id },
            data: { isArchived: true },
        });
        await this.logActivity(id, userId, 'ARCHIVE', { isArchived: false }, { isArchived: true });
        return { message: `Request ${req.requestNo} đã được archive` };
    }
    async restore(id, userId) {
        const req = await this.prisma.request.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Request không tồn tại');
        await this.prisma.request.update({
            where: { id },
            data: { isArchived: false },
        });
        await this.logActivity(id, userId, 'RESTORE', { isArchived: true }, { isArchived: false });
        return { message: `Request ${req.requestNo} đã được restore` };
    }
    async logActivity(entityId, userId, action, before, after) {
        await this.prisma.activityLog.create({
            data: {
                entityType: 'Request',
                entityId,
                userId,
                action,
                changesJson: { before, after },
            },
        });
    }
    async getDepartments() {
        return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
    }
    async getJobTitlesByDepartment(departmentId) {
        return this.prisma.jobTitle.findMany({
            where: { departmentId },
            orderBy: { title: 'asc' },
            select: { id: true, title: true, sGrade: true },
        });
    }
    async getLevels() {
        return this.prisma.level.findMany({ orderBy: { name: 'asc' } });
    }
    async getTracks() {
        return this.prisma.track.findMany({ orderBy: { name: 'asc' } });
    }
    async getSubTracks() {
        return this.prisma.subTrack.findMany({ orderBy: { name: 'asc' } });
    }
    async getUsers() {
        return this.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, fullName: true, email: true, role: true },
            orderBy: { fullName: 'asc' },
        });
    }
    async getFunnelReport(requestId) {
        const exists = await this.prisma.request.findUnique({
            where: { id: requestId },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException('Request không tồn tại');
        const rows = await this.prisma.candidateRequest.findMany({
            where: { requestId, isActive: true },
            select: {
                pipelineSteps: {
                    where: { stepResult: { not: null } },
                    select: { stepNumber: true, stepResult: true },
                },
            },
        });
        return (0, funnel_helper_1.computeFunnelReport)(rows);
    }
    async getActivityLog(requestId) {
        return this.prisma.activityLog.findMany({
            where: { entityType: 'Request', entityId: requestId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { fullName: true, email: true } } },
        });
    }
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestService);
//# sourceMappingURL=request.service.js.map