import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CloseRequestDto } from './dto/close-request.dto';
import { PendingRequestDto, AcceptedOfferDto } from './dto/transition-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import type { FunnelReportDto } from './dto/funnel-response.dto';
export declare class RequestService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateLeadTime(request: any): Promise<{
        actualLeadTimeDays: number | null;
        leadTimeStatus: 'Within leadtime' | 'Over leadtime' | 'N/A' | null;
        standardLeadTimeDays: number | null;
    }>;
    generateRequestNo(departmentId: string, year: number): Promise<{
        requestNo: string;
        codeDept: string;
    }>;
    lookupSGrade(departmentId: string, jobTitleId: string): Promise<string | null>;
    private get requestSelect();
    create(dto: CreateRequestDto, userId: string): Promise<{
        actualLeadTimeDays: number | null;
        leadTimeStatus: "Within leadtime" | "Over leadtime" | "N/A" | null;
        standardLeadTimeDays: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    findAll(dto: ListRequestsDto, userRole: string): Promise<{
        items: {
            offeredCount: number;
            onboardedCount: number;
            actualLeadTimeDays: number | null;
            leadTimeStatus: "Within leadtime" | "Over leadtime" | "N/A" | null;
            standardLeadTimeDays: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            department: {
                id: string;
                name: string;
                code: string;
            };
            level: {
                id: string;
                name: string;
                leadTimeDays: number | null;
            } | null;
            track: {
                id: string;
                name: string;
            } | null;
            subTrack: {
                id: string;
                name: string;
            } | null;
            _count: {
                candidateRequests: number;
            };
            sGrade: string | null;
            jobTitle: {
                id: string;
                title: string;
                sGrade: string | null;
            } | null;
            openDate: Date;
            section: string | null;
            team: string | null;
            hiringManager: string | null;
            shared1Date: Date | null;
            shared2Date: Date | null;
            shared3Date: Date | null;
            typeOfRecruitment: string;
            replaceFor: string | null;
            note: string | null;
            cddAcceptedOfferDate: Date | null;
            onboardDate: Date | null;
            closeReason: string | null;
            pendingReason: string | null;
            status: string;
            requestNo: string;
            codeDept: string;
            pendingStartDate: Date | null;
            pendingEndDate: Date | null;
            pendingDays: number | null;
            isArchived: boolean;
            creator: {
                id: string;
                fullName: string;
            };
            recruiter: {
                id: string;
                email: string;
                fullName: string;
            };
            shared1: {
                id: string;
                fullName: string;
            } | null;
            shared2: {
                id: string;
                fullName: string;
            } | null;
            shared3: {
                id: string;
                fullName: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        actualLeadTimeDays: number | null;
        leadTimeStatus: "Within leadtime" | "Over leadtime" | "N/A" | null;
        standardLeadTimeDays: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    update(id: string, dto: UpdateRequestDto, userId: string): Promise<{
        actualLeadTimeDays: number | null;
        leadTimeStatus: "Within leadtime" | "Over leadtime" | "N/A" | null;
        standardLeadTimeDays: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    private validateTransition;
    setPending(id: string, dto: PendingRequestDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    resume(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    setAcceptedOffer(id: string, dto: AcceptedOfferDto, userId: string): Promise<{
        actualLeadTimeDays: number | null;
        leadTimeStatus: "Within leadtime" | "Over leadtime" | "N/A" | null;
        standardLeadTimeDays: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    setDone(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    closeRequest(id: string, dto: CloseRequestDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: {
            id: string;
            name: string;
            code: string;
        };
        level: {
            id: string;
            name: string;
            leadTimeDays: number | null;
        } | null;
        track: {
            id: string;
            name: string;
        } | null;
        subTrack: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        jobTitle: {
            id: string;
            title: string;
            sGrade: string | null;
        } | null;
        openDate: Date;
        section: string | null;
        team: string | null;
        hiringManager: string | null;
        shared1Date: Date | null;
        shared2Date: Date | null;
        shared3Date: Date | null;
        typeOfRecruitment: string;
        replaceFor: string | null;
        note: string | null;
        cddAcceptedOfferDate: Date | null;
        onboardDate: Date | null;
        closeReason: string | null;
        pendingReason: string | null;
        status: string;
        requestNo: string;
        codeDept: string;
        pendingStartDate: Date | null;
        pendingEndDate: Date | null;
        pendingDays: number | null;
        isArchived: boolean;
        creator: {
            id: string;
            fullName: string;
        };
        recruiter: {
            id: string;
            email: string;
            fullName: string;
        };
        shared1: {
            id: string;
            fullName: string;
        } | null;
        shared2: {
            id: string;
            fullName: string;
        } | null;
        shared3: {
            id: string;
            fullName: string;
        } | null;
    }>;
    archive(id: string, userId: string): Promise<{
        message: string;
    }>;
    restore(id: string, userId: string): Promise<{
        message: string;
    }>;
    private logActivity;
    getDepartments(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }[]>;
    getJobTitlesByDepartment(departmentId: string): Promise<{
        id: string;
        title: string;
        sGrade: string | null;
    }[]>;
    getLevels(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        leadTimeDays: number | null;
    }[]>;
    getTracks(): Promise<{
        id: string;
        name: string;
    }[]>;
    getSubTracks(): Promise<{
        id: string;
        name: string;
    }[]>;
    getUsers(): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
    }[]>;
    getFunnelReport(requestId: string): Promise<FunnelReportDto>;
    getActivityLog(requestId: string): Promise<({
        user: {
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
    })[]>;
}
