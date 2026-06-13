import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// ============================================================
// PHONE NORMALIZATION — +84xxxxxxxxx
// ============================================================
function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\.]/g, '');
  if (p.startsWith('0')) p = '+84' + p.slice(1);
  else if (p.startsWith('84') && !p.startsWith('+')) p = '+' + p;
  else if (!p.startsWith('+84')) p = '+84' + p;
  return p;
}

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

@Injectable()
export class CandidateService {
  private supabase;
  private readonly logger = new Logger(CandidateService.name);

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  // ============================================================
  // CANDIDATE SELECT SHAPE
  // ============================================================
  private get candidateSelect() {
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
        orderBy: { versionNumber: 'desc' as const },
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
    } as const;
  }

  // ============================================================
  // CREATE
  // ============================================================
  async create(dto: CreateCandidateDto, userId: string) {
    // Validate at least one contact
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Bắt buộc nhập ít nhất Email hoặc Số điện thoại',
      );
    }

    const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
    const phone = dto.phone ? normalizePhone(dto.phone) : undefined;

    // Check uniqueness manually for better error messages
    if (email) {
      const existing = await this.prisma.candidate.findUnique({
        where: { email },
      });
      if (existing)
        throw new ConflictException(`Email ${email} đã tồn tại trong hệ thống`);
    }
    if (phone) {
      const existing = await this.prisma.candidate.findUnique({
        where: { phone },
      });
      if (existing)
        throw new ConflictException(
          `Số điện thoại ${phone} đã tồn tại trong hệ thống`,
        );
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

  // ============================================================
  // LIST
  // ============================================================
  async findAll(dto: ListCandidatesDto, userRole: string) {
    const {
      search,
      picId,
      cvSourceId,
      isBlacklisted,
      includeArchived,
      page = 1,
      limit = 20,
      sortBy,
      sortOrder,
    } = dto;

    const where: any = {
      isArchived: includeArchived && userRole === 'admin' ? undefined : false,
    };

    if (isBlacklisted !== undefined) where.isBlacklisted = isBlacklisted;
    if (picId) where.picId = picId;
    if (cvSourceId) where.cvSourceId = cvSourceId;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { currentCompany: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = sortBy
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

  // ============================================================
  // FIND ONE
  // ============================================================
  async findOne(id: string) {
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
      } as any,
    });
    if (!candidate) throw new NotFoundException('Ứng viên không tồn tại');
    return candidate;
  }

  // ============================================================
  // UPDATE
  // ============================================================
  async update(id: string, dto: UpdateCandidateDto, userId: string) {
    const existing = await this.findOne(id);

    const logBefore: Record<string, any> = {};
    const logAfter: Record<string, any> = {};

    const email = dto.email ? dto.email.toLowerCase().trim() : undefined;
    const phone = dto.phone ? normalizePhone(dto.phone) : undefined;

    // Check email uniqueness if changing
    if (email && email !== (existing as any).email) {
      const dup = await this.prisma.candidate.findFirst({
        where: { email, NOT: { id } },
      });
      if (dup) throw new ConflictException(`Email ${email} đã tồn tại`);
      logBefore['Email'] = (existing as any).email ?? '(trống)';
      logAfter['Email'] = email;
    }
    if (phone && phone !== (existing as any).phone) {
      const dup = await this.prisma.candidate.findFirst({
        where: { phone, NOT: { id } },
      });
      if (dup) throw new ConflictException(`Số điện thoại ${phone} đã tồn tại`);
      logBefore['Số điện thoại'] = (existing as any).phone ?? '(trống)';
      logAfter['Số điện thoại'] = phone;
    }

    const fieldMap: Record<string, string> = {
      fullName: 'Tên',
      sGrade: 'S-Grade',
      currentCompany: 'Công ty',
      industry: 'Ngành',
      cvLink: 'CV Link',
      isBlacklisted: 'Blacklist',
      blacklistReason: 'Lý do Blacklist',
    };
    for (const [key, label] of Object.entries(fieldMap)) {
      if (
        (dto as any)[key] !== undefined &&
        (dto as any)[key] !== (existing as any)[key]
      ) {
        logBefore[label] = (existing as any)[key] ?? '(trống)';
        logAfter[label] = (dto as any)[key];
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

  // ============================================================
  // CV UPLOAD — private Supabase bucket, signed URL
  // ============================================================
  async uploadCv(
    candidateId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    // Validate type
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file PDF hoặc DOCX');
    }
    // Validate size
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('File quá lớn — tối đa 10MB');
    }

    // Find candidate
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: candidateId },
    });
    if (!candidate) throw new NotFoundException('Ứng viên không tồn tại');

    // Determine version number
    const lastCv = await this.prisma.candidateCv.findFirst({
      where: { candidateId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (lastCv?.versionNumber ?? 0) + 1;

    const ext = path.extname(file.originalname).toLowerCase();
    const filePath = `cvs/${candidateId}/v${versionNumber}_${Date.now()}${ext}`;

    // Upload to Supabase private bucket
    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_CV_BUCKET!)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      // Log internal Supabase error details server-side only — never expose to client
      this.logger.error(
        `Supabase upload failed for candidate ${candidateId}: ${error.message}`,
      );
      throw new BadRequestException(
        'Upload CV thất bại. Vui lòng thử lại hoặc liên hệ Admin.',
      );
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

  // ============================================================
  // SIGNED URL for CV download
  // ============================================================
  async getCvSignedUrl(cvId: string) {
    const cv = await this.prisma.candidateCv.findUnique({
      where: { id: cvId },
    });
    if (!cv) throw new NotFoundException('CV không tồn tại');
    const signedUrl = await this.getSignedUrl(cv.filePath);
    return { signedUrl, fileName: cv.fileName };
  }

  private async getSignedUrl(filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_CV_BUCKET!)
      .createSignedUrl(filePath, 60 * 60); // 1 hour
    if (error) {
      // Log internal Supabase error server-side only — never expose to client
      this.logger.error(
        `Supabase signed URL creation failed for path ${filePath}: ${error.message}`,
      );
      throw new BadRequestException(
        'Không thể tạo link tải CV. Vui lòng thử lại hoặc liên hệ Admin.',
      );
    }
    return data.signedUrl;
  }

  // ============================================================
  // ARCHIVE / RESTORE
  // ============================================================
  async archive(id: string, userId: string) {
    await this.prisma.candidate.update({
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
    return { message: 'Đã archive ứng viên' };
  }

  async restore(id: string, userId: string) {
    await this.prisma.candidate.update({
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
    return { message: 'Đã restore ứng viên' };
  }

  // ============================================================
  // ACTIVITY LOG
  // ============================================================
  async getActivityLog(candidateId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType: 'Candidate', entityId: candidateId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true } } },
    });
  }

  private async logActivity(
    entityId: string,
    userId: string,
    action: string,
    before: any,
    after: any,
  ) {
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

  // ============================================================
  // MASTER DATA
  // ============================================================
  async getCvSources() {
    return this.prisma.cvSource.findMany({ orderBy: { name: 'asc' } });
  }
}
