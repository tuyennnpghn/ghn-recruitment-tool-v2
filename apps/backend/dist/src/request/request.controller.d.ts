import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CloseRequestDto } from './dto/close-request.dto';
import { PendingRequestDto, AcceptedOfferDto } from './dto/transition-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
export declare class RequestController {
    private requestService;
    constructor(requestService: RequestService);
    getDepartments(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        code: string;
    }[]>;
    getJobTitles(id: string): Promise<{
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
    create(dto: CreateRequestDto, user: {
        id: string;
    }): Promise<{
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
    findAll(dto: ListRequestsDto, user: {
        role: string;
    }): Promise<{
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
    update(id: string, dto: UpdateRequestDto, user: {
        id: string;
    }): Promise<{
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
    setPending(id: string, dto: PendingRequestDto, user: {
        id: string;
    }): Promise<{
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
    resume(id: string, user: {
        id: string;
    }): Promise<{
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
    setAcceptedOffer(id: string, dto: AcceptedOfferDto, user: {
        id: string;
    }): Promise<{
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
    setDone(id: string, user: {
        id: string;
    }): Promise<{
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
    close(id: string, dto: CloseRequestDto, user: {
        id: string;
    }): Promise<{
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
    archive(id: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    restore(id: string, user: {
        id: string;
    }): Promise<{
        message: string;
    }>;
    getFunnelReport(id: string): Promise<import("./dto/funnel-response.dto").FunnelReportDto>;
    getActivityLog(id: string): Promise<({
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
