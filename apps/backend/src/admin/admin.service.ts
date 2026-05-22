import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    fullName: true,
    role: true,
    isActive: true,
    createdAt: true,
  } as const;

  // ─── User ──────────────────────────────────────────────────────────────────

  listUsers() {
    return this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: { fullName: 'asc' },
    });
  }

  async createUser(data: { email: string; fullName: string; password: string; role: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashed },
      select: this.userSelect,
    });
  }

  updateUser(id: string, data: { fullName?: string; email?: string; role?: string; isActive?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect,
    });
  }

  async resetPassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
  }

  async deleteUser(id: string) {
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
    } else {
      await this.prisma.user.delete({ where: { id } });
    }
  }

  // ─── Activity Log ──────────────────────────────────────────────────────────

  async listActivityLogs(params: {
    page?: number
    limit?: number
    entityType?: string
    userId?: string
    action?: string
    from?: string
    to?: string
  }) {
    const page  = params.page  ?? 1;
    const limit = params.limit ?? 50;
    const skip  = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {
      ...(params.entityType && { entityType: params.entityType }),
      ...(params.userId     && { userId:     params.userId }),
      ...(params.action     && { action:     params.action }),
      ...((params.from || params.to) && {
        createdAt: {
          ...(params.from && { gte: new Date(params.from) }),
          ...(params.to   && { lte: new Date(params.to)   }),
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

  // ─── CvSource ──────────────────────────────────────────────────────────────

  listCvSources() {
    return this.prisma.cvSource.findMany({ orderBy: { name: 'asc' } });
  }

  createCvSource(name: string) {
    return this.prisma.cvSource.create({ data: { name } });
  }

  updateCvSource(id: string, name: string) {
    return this.prisma.cvSource.update({ where: { id }, data: { name } });
  }

  deleteCvSource(id: string) {
    return this.prisma.cvSource.delete({ where: { id } });
  }

  // ─── Level ─────────────────────────────────────────────────────────────────

  listLevels() {
    return this.prisma.level.findMany({ orderBy: { name: 'asc' } });
  }

  createLevel(name: string, leadTimeDays?: number | null) {
    return this.prisma.level.create({ data: { name, leadTimeDays: leadTimeDays ?? null } });
  }

  updateLevel(id: string, name: string, leadTimeDays?: number | null) {
    return this.prisma.level.update({
      where: { id },
      data: { name, ...(leadTimeDays !== undefined && { leadTimeDays }) },
    });
  }

  deleteLevel(id: string) {
    return this.prisma.level.delete({ where: { id } });
  }

  // ─── Department ────────────────────────────────────────────────────────────

  listDepartments() {
    return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
  }

  createDepartment(code: string, name: string) {
    return this.prisma.department.create({ data: { code, name } });
  }

  updateDepartment(id: string, data: { code?: string; name?: string }) {
    return this.prisma.department.update({ where: { id }, data });
  }

  deleteDepartment(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }

  // ─── JobTitle ──────────────────────────────────────────────────────────────

  listJobTitles(departmentId?: string) {
    return this.prisma.jobTitle.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: [{ departmentId: 'asc' }, { title: 'asc' }],
      include: { department: { select: { id: true, name: true } } },
    });
  }

  createJobTitle(departmentId: string, title: string, sGrade?: string | null) {
    return this.prisma.jobTitle.create({
      data: { departmentId, title, sGrade: sGrade ?? null },
      include: { department: { select: { id: true, name: true } } },
    });
  }

  updateJobTitle(id: string, data: { title?: string; sGrade?: string | null }) {
    return this.prisma.jobTitle.update({
      where: { id },
      data,
      include: { department: { select: { id: true, name: true } } },
    });
  }

  deleteJobTitle(id: string) {
    return this.prisma.jobTitle.delete({ where: { id } });
  }

  // ─── Track ─────────────────────────────────────────────────────────────────

  listTracks() {
    return this.prisma.track.findMany({ orderBy: { name: 'asc' } });
  }

  createTrack(name: string) {
    return this.prisma.track.create({ data: { name } });
  }

  updateTrack(id: string, name: string) {
    return this.prisma.track.update({ where: { id }, data: { name } });
  }

  deleteTrack(id: string) {
    return this.prisma.track.delete({ where: { id } });
  }

  // ─── SubTrack ──────────────────────────────────────────────────────────────

  listSubTracks() {
    return this.prisma.subTrack.findMany({ orderBy: { name: 'asc' } });
  }

  createSubTrack(name: string) {
    return this.prisma.subTrack.create({ data: { name } });
  }

  updateSubTrack(id: string, name: string) {
    return this.prisma.subTrack.update({ where: { id }, data: { name } });
  }

  deleteSubTrack(id: string) {
    return this.prisma.subTrack.delete({ where: { id } });
  }
}
