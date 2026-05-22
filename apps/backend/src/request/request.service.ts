import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CloseRequestDto } from './dto/close-request.dto';
import {
  PendingRequestDto,
  AcceptedOfferDto,
} from './dto/transition-request.dto';
import { ListRequestsDto, RequestStatus } from './dto/list-requests.dto';
import { computeFunnelReport } from './funnel.helper';
import type { FunnelReportDto } from './dto/funnel-response.dto';

// ============================================================
// STATE MACHINE — Transition table per requirements §5
// ============================================================
const VALID_TRANSITIONS: Record<string, string[]> = {
  Opening: ['Pending', 'Accepted offer', 'Close'],
  Pending: ['Opening', 'Close'], // Opening = Resume
  'Accepted offer': ['Done', 'Close'],
  Done: [], // terminal
  Close: [], // terminal
};

/**
 * Returns today's date as midnight UTC, using Vietnam timezone (UTC+7).
 * Storing this ensures date displays correctly regardless of browser timezone:
 * - "2026-05-17T00:00:00Z" → getUTCDate()=17, getUTCMonth()=4  ✓
 */
function vnMidnight(d?: Date): Date {
  const src = d ?? new Date();
  const vn = new Date(src.getTime() + 7 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()),
  );
}

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // LEAD-TIME CALCULATION (runtime, not stored in DB)
  // ============================================================
  async calculateLeadTime(request: any): Promise<{
    actualLeadTimeDays: number | null;
    leadTimeStatus: 'Within leadtime' | 'Over leadtime' | 'N/A' | null;
    standardLeadTimeDays: number | null;
  }> {
    // Consultant (Project-based) has NULL leadTimeDays → N/A
    if (!request.level || request.level.leadTimeDays === null) {
      return {
        actualLeadTimeDays: null,
        leadTimeStatus: 'N/A',
        standardLeadTimeDays: null,
      };
    }

    const standardDays: number = request.level.leadTimeDays;

    // Count holiday days between openDate and reference date
    const openDate = new Date(request.openDate);
    const today = new Date();

    // Reference date:
    // Case 1: has cddAcceptedOfferDate → use it
    // Case 2: no offer date, not Pending → use today
    // Case 3: Pending → lead time paused (use today but it stays frozen)
    let referenceDate: Date;
    if (request.cddAcceptedOfferDate) {
      referenceDate = new Date(request.cddAcceptedOfferDate);
    } else {
      referenceDate = today;
    }

    // Count holidays between openDate and referenceDate
    const holidays = await this.prisma.holidayCalendar.findMany({
      where: {
        holidayDate: {
          gte: openDate,
          lte: referenceDate,
        },
      },
    });
    const holidayDays = holidays.length;

    // Calendar days
    const calendarDays = Math.floor(
      (referenceDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Pending days (already stored in DB if resolved, else 0)
    const pendingDays = request.pendingDays ?? 0;

    const actualLeadTimeDays = Math.max(
      0,
      calendarDays - pendingDays - holidayDays,
    );

    const leadTimeStatus: 'Within leadtime' | 'Over leadtime' =
      actualLeadTimeDays <= standardDays ? 'Within leadtime' : 'Over leadtime';

    return {
      actualLeadTimeDays,
      leadTimeStatus,
      standardLeadTimeDays: standardDays,
    };
  }

  // ============================================================
  // REQUEST NO. GENERATION — format: YY_CodeDept_NNNN
  // ============================================================
  async generateRequestNo(
    departmentId: string,
    year: number,
  ): Promise<{ requestNo: string; codeDept: string }> {
    const dept = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!dept) throw new NotFoundException('Phòng ban không tồn tại');

    const yy = String(year).slice(-2);

    // Atomic increment via upsert + update
    const counter = await this.prisma.requestNoCounter.upsert({
      where: { departmentId_year: { departmentId, year } },
      create: { departmentId, year, lastSequence: 1 },
      update: { lastSequence: { increment: 1 } },
    });

    const seq = String(counter.lastSequence).padStart(4, '0');
    const requestNo = `${yy}_${dept.code}_${seq}`;

    return { requestNo, codeDept: dept.code };
  }

  // ============================================================
  // S-GRADE LOOKUP
  // ============================================================
  async lookupSGrade(
    departmentId: string,
    jobTitleId: string,
  ): Promise<string | null> {
    const jobTitle = await this.prisma.jobTitle.findFirst({
      where: { id: jobTitleId, departmentId },
    });
    return jobTitle?.sGrade ?? null;
  }

  // ============================================================
  // REQUEST SELECT SHAPE (reused in all queries)
  // ============================================================
  private get requestSelect() {
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
    } as const;
  }

  // ============================================================
  // CREATE REQUEST
  // ============================================================
  async create(dto: CreateRequestDto, userId: string) {
    const openDate = new Date(dto.openDate);
    const year = openDate.getFullYear();

    const { requestNo, codeDept } = await this.generateRequestNo(
      dto.departmentId,
      year,
    );

    // Lookup s_grade
    let sGrade: string | null = null;
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

    // Activity log
    await this.logActivity(request.id, userId, 'CREATE', null, {
      status: 'Opening',
    });

    const leadTime = await this.calculateLeadTime(request);
    return { ...request, ...leadTime };
  }

  // ============================================================
  // LIST REQUESTS
  // ============================================================
  async findAll(dto: ListRequestsDto, userRole: string) {
    const {
      status,
      departmentId,
      recruiterId,
      month,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      includeArchived,
    } = dto;

    const skip = ((page ?? 1) - 1) * (limit ?? 20);
    const take = limit ?? 20;

    const where: any = {
      isArchived: includeArchived && userRole === 'admin' ? undefined : false,
    };

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (recruiterId) where.recruiterId = recruiterId;
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

    const orderBy: any = sortBy
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

    // One query for the whole page — group offered/onboarded counts by requestId
    const statusCounts =
      requests.length > 0
        ? await this.prisma.candidateRequest.groupBy({
            by: ['requestId', 'overallStatus'],
            where: {
              requestId: { in: requests.map((r) => r.id) },
              overallStatus: { in: ['Offer', 'Onboarded'] },
            },
            _count: { id: true },
          })
        : [];

    const offerMap: Record<string, number> = {};
    const onboardMap: Record<string, number> = {};
    for (const row of statusCounts) {
      if (row.overallStatus === 'Offer') offerMap[row.requestId] = row._count.id;
      if (row.overallStatus === 'Onboarded') onboardMap[row.requestId] = row._count.id;
    }

    // Compute lead-time for each
    const items = await Promise.all(
      requests.map(async (r) => {
        const lt = await this.calculateLeadTime(r);
        return { ...r, ...lt, offeredCount: offerMap[r.id] ?? 0, onboardedCount: onboardMap[r.id] ?? 0 };
      }),
    );

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

  // ============================================================
  // FIND ONE
  // ============================================================
  async findOne(id: string) {
    const request = await this.prisma.request.findFirst({
      where: { id, isArchived: false },
      select: this.requestSelect,
    });
    if (!request) throw new NotFoundException('Request không tồn tại');

    const lt = await this.calculateLeadTime(request);
    return { ...request, ...lt };
  }

  // ============================================================
  // UPDATE REQUEST
  // ============================================================
  async update(id: string, dto: UpdateRequestDto, userId: string) {
    const existing = await this.findOne(id);

    // Block update on terminal status
    if (existing.status === 'Close' || existing.status === 'Done') {
      throw new BadRequestException(
        `Không thể chỉnh sửa request ở trạng thái ${existing.status}`,
      );
    }

    // Re-lookup s_grade if jobTitle or dept changed
    let sGrade = (existing as any).sGrade;
    const deptId = (existing as any).department?.id;
    let newJobTitle: any = null;
    let newLevel: any = null;
    let newRecruiter: any = null;

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

    // Build human-readable before/after for activity log
    const logBefore: Record<string, any> = {};
    const logAfter: Record<string, any> = {};

    if (
      dto.jobTitleId !== undefined &&
      dto.jobTitleId !== (existing as any).jobTitle?.id
    ) {
      logBefore['Job Title'] = (existing as any).jobTitle?.title ?? '(trống)';
      logAfter['Job Title'] = newJobTitle?.title ?? dto.jobTitleId;
      const oldSGrade = (existing as any).sGrade;
      if (oldSGrade !== sGrade) {
        logBefore['S-Grade'] = oldSGrade ?? '(trống)';
        logAfter['S-Grade'] = sGrade ?? '(trống)';
      }
    }
    if (
      dto.levelId !== undefined &&
      dto.levelId !== (existing as any).level?.id
    ) {
      logBefore['Level'] = (existing as any).level?.name ?? '(trống)';
      logAfter['Level'] = newLevel?.name ?? dto.levelId;
    }
    if (
      dto.recruiterId &&
      dto.recruiterId !== (existing as any).recruiter?.id
    ) {
      logBefore['Recruiter'] =
        (existing as any).recruiter?.fullName ?? '(trống)';
      logAfter['Recruiter'] = newRecruiter?.fullName ?? dto.recruiterId;
    }
    if (
      dto.hiringManager !== undefined &&
      dto.hiringManager !== (existing as any).hiringManager
    ) {
      logBefore['Hiring Manager'] =
        (existing as any).hiringManager ?? '(trống)';
      logAfter['Hiring Manager'] = dto.hiringManager;
    }
    if (dto.note !== undefined && dto.note !== (existing as any).note) {
      logBefore['Ghi chú'] = (existing as any).note ?? '(trống)';
      logAfter['Ghi chú'] = dto.note;
    }
    if (
      dto.trackId !== undefined &&
      dto.trackId !== (existing as any).track?.id
    ) {
      const newTrack = dto.trackId
        ? await this.prisma.track.findUnique({ where: { id: dto.trackId } })
        : null;
      logBefore['Track'] = (existing as any).track?.name ?? '(trống)';
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

    // Only log if there are actual changes
    if (Object.keys(logAfter).length > 0) {
      await this.logActivity(id, userId, 'UPDATE', logBefore, logAfter);
    }
    const lt = await this.calculateLeadTime(updated);
    return { ...updated, ...lt };
  }

  // ============================================================
  // STATE TRANSITIONS
  // ============================================================
  private validateTransition(fromStatus: string, toStatus: string) {
    const allowed = VALID_TRANSITIONS[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${fromStatus}" sang "${toStatus}"`,
      );
    }
  }

  /** Opening → Pending */
  async setPending(id: string, dto: PendingRequestDto, userId: string) {
    const req = await this.findOne(id);
    this.validateTransition(req.status, 'Pending');

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'Pending',
        pendingStartDate: vnMidnight(), // VN date at midnight UTC — timezone-safe
        pendingReason: dto.pendingReason,
        pendingEndDate: null,
      },
      select: this.requestSelect,
    });

    await this.logActivity(
      id,
      userId,
      'UPDATE',
      { status: req.status },
      { status: 'Pending', pendingReason: dto.pendingReason },
    );
    return updated;
  }

  /** Pending → Opening (Resume) */
  async resume(id: string, userId: string) {
    const req = await this.findOne(id);
    this.validateTransition(req.status, 'Opening');

    if (req.status !== 'Pending') {
      throw new BadRequestException(
        'Chỉ có thể Resume khi request đang ở trạng thái Pending',
      );
    }

    // Both dates stored as VN midnight UTC → diff is always whole days
    const endDate = vnMidnight();
    const startDate = req.pendingStartDate
      ? vnMidnight(new Date(req.pendingStartDate))
      : endDate;
    const pendingDaysDelta = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPendingDays =
      (req.pendingDays ?? 0) + Math.max(0, pendingDaysDelta);

    const updated = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'Opening',
        pendingEndDate: endDate, // VN midnight UTC — timezone-safe
        pendingDays: totalPendingDays,
      },
      select: this.requestSelect,
    });

    await this.logActivity(
      id,
      userId,
      'UPDATE',
      { status: 'Pending' },
      { status: 'Opening', pendingDays: totalPendingDays },
    );
    return updated;
  }

  /** Opening → Accepted offer */
  async setAcceptedOffer(id: string, dto: AcceptedOfferDto, userId: string) {
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

    await this.logActivity(
      id,
      userId,
      'UPDATE',
      { status: req.status },
      {
        status: 'Accepted offer',
        cddAcceptedOfferDate: dto.cddAcceptedOfferDate,
      },
    );
    const lt = await this.calculateLeadTime(updated);
    return { ...updated, ...lt };
  }

  /** Accepted offer → Done */
  async setDone(id: string, userId: string) {
    const req = await this.findOne(id);
    this.validateTransition(req.status, 'Done');

    const updated = await this.prisma.request.update({
      where: { id },
      data: { status: 'Done' },
      select: this.requestSelect,
    });

    await this.logActivity(
      id,
      userId,
      'UPDATE',
      { status: req.status },
      { status: 'Done' },
    );
    return updated;
  }

  /** Close — requires closeReason and no active candidates */
  async closeRequest(id: string, dto: CloseRequestDto, userId: string) {
    const req = await this.findOne(id);
    this.validateTransition(req.status, 'Close');

    // Check no active candidates (is_active = true in candidate_requests)
    const activeCount = await this.prisma.candidateRequest.count({
      where: { requestId: id, isActive: true },
    });
    if (activeCount > 0) {
      throw new BadRequestException(
        `Không thể close request khi còn ${activeCount} ứng viên chưa đóng. Vui lòng đóng tất cả ứng viên trước.`,
      );
    }

    const updated = await this.prisma.request.update({
      where: { id },
      data: { status: 'Close', closeReason: dto.closeReason },
      select: this.requestSelect,
    });

    await this.logActivity(
      id,
      userId,
      'UPDATE',
      { status: req.status },
      { status: 'Close', closeReason: dto.closeReason },
    );
    return updated;
  }

  // ============================================================
  // ARCHIVE / RESTORE (admin only)
  // ============================================================
  async archive(id: string, userId: string) {
    const req = await this.findOne(id);
    await this.prisma.request.update({
      where: { id },
      data: { isArchived: true },
    });
    await this.logActivity(
      id,
      userId,
      'ARCHIVE',
      { isArchived: false },
      { isArchived: true },
    );
    return { message: `Request ${req.requestNo} đã được archive` };
  }

  async restore(id: string, userId: string) {
    const req = await this.prisma.request.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request không tồn tại');
    await this.prisma.request.update({
      where: { id },
      data: { isArchived: false },
    });
    await this.logActivity(
      id,
      userId,
      'RESTORE',
      { isArchived: true },
      { isArchived: false },
    );
    return { message: `Request ${req.requestNo} đã được restore` };
  }

  // ============================================================
  // ACTIVITY LOG HELPER
  // ============================================================
  private async logActivity(
    entityId: string,
    userId: string,
    action: string,
    before: any,
    after: any,
  ) {
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

  // ============================================================
  // MASTER DATA HELPERS (for dropdowns)
  // ============================================================
  async getDepartments() {
    return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
  }

  async getJobTitlesByDepartment(departmentId: string) {
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

  // ============================================================
  // FUNNEL REPORT — aggregate pipeline metrics for a request
  // ============================================================
  async getFunnelReport(requestId: string): Promise<FunnelReportDto> {
    const exists = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Request không tồn tại');

    const rows = await this.prisma.candidateRequest.findMany({
      where: { requestId, isActive: true },
      select: {
        pipelineSteps: {
          where: { stepResult: { not: null } },
          select: { stepNumber: true, stepResult: true },
        },
      },
    });

    return computeFunnelReport(rows);
  }

  // ============================================================
  // ACTIVITY LOG READ
  // ============================================================
  async getActivityLog(requestId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType: 'Request', entityId: requestId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, email: true } } },
    });
  }
}
