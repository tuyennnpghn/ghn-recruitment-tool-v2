import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly userSelect;
    listUsers(): Prisma.PrismaPromise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    createUser(data: {
        email: string;
        fullName: string;
        password: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateUser(id: string, data: {
        fullName?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
    }): Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    resetPassword(id: string, newPassword: string): Promise<void>;
    deleteUser(id: string): Promise<void>;
    listActivityLogs(params: {
        page?: number;
        limit?: number;
        entityType?: string;
        userId?: string;
        action?: string;
        from?: string;
        to?: string;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            entityType: string;
            entityId: string;
            action: string;
            changesJson: Prisma.JsonValue | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    listCvSources(): Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createCvSource(name: string): Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateCvSource(id: string, name: string): Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteCvSource(id: string): Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listLevels(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }[]>;
    createLevel(name: string, leadTimeDays?: number | null): Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateLevel(id: string, name: string, leadTimeDays?: number | null): Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteLevel(id: string): Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listDepartments(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }[]>;
    createDepartment(code: string, name: string): Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateDepartment(id: string, data: {
        code?: string;
        name?: string;
    }): Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteDepartment(id: string): Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listJobTitles(departmentId?: string): Prisma.PrismaPromise<({
        department: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        sGrade: string | null;
        departmentId: string;
    })[]>;
    createJobTitle(departmentId: string, title: string, sGrade?: string | null): Prisma.Prisma__JobTitleClient<{
        department: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        sGrade: string | null;
        departmentId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateJobTitle(id: string, data: {
        title?: string;
        sGrade?: string | null;
    }): Prisma.Prisma__JobTitleClient<{
        department: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        sGrade: string | null;
        departmentId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteJobTitle(id: string): Prisma.Prisma__JobTitleClient<{
        id: string;
        createdAt: Date;
        title: string;
        sGrade: string | null;
        departmentId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listTracks(): Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createTrack(name: string): Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateTrack(id: string, name: string): Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteTrack(id: string): Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listSubTracks(): Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createSubTrack(name: string): Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateSubTrack(id: string, name: string): Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteSubTrack(id: string): Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
