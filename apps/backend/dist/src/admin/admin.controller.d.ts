import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listActivityLogs(page?: string, limit?: string, entityType?: string, userId?: string, action?: string, from?: string, to?: string): Promise<{
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
            changesJson: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    listUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    createUser(body: {
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
    updateUser(id: string, body: {
        fullName?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
    }): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    resetPassword(id: string, body: {
        newPassword: string;
    }): Promise<void>;
    deleteUser(id: string): Promise<void>;
    listCvSources(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createCvSource(body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateCvSource(id: string, body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteCvSource(id: string): import(".prisma/client").Prisma.Prisma__CvSourceClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listLevels(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }[]>;
    createLevel(body: {
        name: string;
        leadTimeDays?: number | null;
    }): import(".prisma/client").Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateLevel(id: string, body: {
        name: string;
        leadTimeDays?: number | null;
    }): import(".prisma/client").Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteLevel(id: string): import(".prisma/client").Prisma.Prisma__LevelClient<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listDepartments(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }[]>;
    createDepartment(body: {
        code: string;
        name: string;
    }): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateDepartment(id: string, body: {
        code?: string;
        name?: string;
    }): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteDepartment(id: string): import(".prisma/client").Prisma.Prisma__DepartmentClient<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listJobTitles(departmentId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    createJobTitle(body: {
        departmentId: string;
        title: string;
        sGrade?: string | null;
    }): import(".prisma/client").Prisma.Prisma__JobTitleClient<{
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
    updateJobTitle(id: string, body: {
        title?: string;
        sGrade?: string | null;
    }): import(".prisma/client").Prisma.Prisma__JobTitleClient<{
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
    deleteJobTitle(id: string): import(".prisma/client").Prisma.Prisma__JobTitleClient<{
        id: string;
        createdAt: Date;
        title: string;
        sGrade: string | null;
        departmentId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listTracks(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createTrack(body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateTrack(id: string, body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteTrack(id: string): import(".prisma/client").Prisma.Prisma__TrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listSubTracks(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    createSubTrack(body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateSubTrack(id: string, body: {
        name: string;
    }): import(".prisma/client").Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    deleteSubTrack(id: string): import(".prisma/client").Prisma.Prisma__SubTrackClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
