import { PrismaService } from '../prisma/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
export declare class CandidateService {
    private prisma;
    private supabase;
    constructor(prisma: PrismaService);
    private get candidateSelect();
    create(dto: CreateCandidateDto, userId: string): Promise<{
        id: string;
        email: string | null;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
        cvSource: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        isArchived: boolean;
        candidateRequests: {
            overallStatus: string | null;
        }[];
        creator: {
            id: string;
            fullName: string;
        };
        phone: string | null;
        currentCompany: string | null;
        industry: string | null;
        cvLink: string | null;
        isBlacklisted: boolean;
        blacklistReason: string | null;
        currentSalary: import("@prisma/client/runtime/library").Decimal | null;
        expectedSalary: import("@prisma/client/runtime/library").Decimal | null;
        salaryNote: string | null;
        cvs: {
            id: string;
            filePath: string;
            fileName: string;
            fileSizeBytes: number;
            fileType: string;
            versionNumber: number;
            uploadedAt: Date;
            uploader: {
                fullName: string;
            };
        }[];
        pic: {
            id: string;
            fullName: string;
        };
    }>;
    findAll(dto: ListCandidatesDto, userRole: string): Promise<{
        items: {
            id: string;
            email: string | null;
            fullName: string;
            createdAt: Date;
            updatedAt: Date;
            cvSource: {
                id: string;
                name: string;
            } | null;
            _count: {
                candidateRequests: number;
            };
            sGrade: string | null;
            isArchived: boolean;
            candidateRequests: {
                overallStatus: string | null;
            }[];
            creator: {
                id: string;
                fullName: string;
            };
            phone: string | null;
            currentCompany: string | null;
            industry: string | null;
            cvLink: string | null;
            isBlacklisted: boolean;
            blacklistReason: string | null;
            currentSalary: import("@prisma/client/runtime/library").Decimal | null;
            expectedSalary: import("@prisma/client/runtime/library").Decimal | null;
            salaryNote: string | null;
            cvs: {
                id: string;
                filePath: string;
                fileName: string;
                fileSizeBytes: number;
                fileType: string;
                versionNumber: number;
                uploadedAt: Date;
                uploader: {
                    fullName: string;
                };
            }[];
            pic: {
                id: string;
                fullName: string;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        [x: string]: ({
            id: string;
            candidateId: string;
            filePath: string;
            fileName: string;
            fileSizeBytes: number;
            fileType: string;
            versionNumber: number;
            uploadedBy: string;
            uploadedAt: Date;
        } | {
            id: string;
            candidateId: string;
            filePath: string;
            fileName: string;
            fileSizeBytes: number;
            fileType: string;
            versionNumber: number;
            uploadedBy: string;
            uploadedAt: Date;
        })[] | ({
            id: string;
            isActive: boolean;
            candidateId: string;
            requestId: string;
            currentStep: number;
            overallStatus: string | null;
            matchedBy: string;
            matchedAt: Date;
        } | {
            id: string;
            isActive: boolean;
            candidateId: string;
            requestId: string;
            currentStep: number;
            overallStatus: string | null;
            matchedBy: string;
            matchedAt: Date;
        })[] | {
            id: string;
            candidateId: string;
            filePath: string;
            fileName: string;
            fileSizeBytes: number;
            fileType: string;
            versionNumber: number;
            uploadedBy: string;
            uploadedAt: Date;
        }[] | {
            id: string;
            isActive: boolean;
            candidateId: string;
            requestId: string;
            currentStep: number;
            overallStatus: string | null;
            matchedBy: string;
            matchedAt: Date;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
    update(id: string, dto: UpdateCandidateDto, userId: string): Promise<{
        id: string;
        email: string | null;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
        cvSource: {
            id: string;
            name: string;
        } | null;
        _count: {
            candidateRequests: number;
        };
        sGrade: string | null;
        isArchived: boolean;
        candidateRequests: {
            overallStatus: string | null;
        }[];
        creator: {
            id: string;
            fullName: string;
        };
        phone: string | null;
        currentCompany: string | null;
        industry: string | null;
        cvLink: string | null;
        isBlacklisted: boolean;
        blacklistReason: string | null;
        currentSalary: import("@prisma/client/runtime/library").Decimal | null;
        expectedSalary: import("@prisma/client/runtime/library").Decimal | null;
        salaryNote: string | null;
        cvs: {
            id: string;
            filePath: string;
            fileName: string;
            fileSizeBytes: number;
            fileType: string;
            versionNumber: number;
            uploadedAt: Date;
            uploader: {
                fullName: string;
            };
        }[];
        pic: {
            id: string;
            fullName: string;
        };
    }>;
    uploadCv(candidateId: string, file: Express.Multer.File, userId: string): Promise<{
        signedUrl: string;
        id: string;
        candidateId: string;
        filePath: string;
        fileName: string;
        fileSizeBytes: number;
        fileType: string;
        versionNumber: number;
        uploadedBy: string;
        uploadedAt: Date;
    }>;
    getCvSignedUrl(cvId: string): Promise<{
        signedUrl: string;
        fileName: string;
    }>;
    private getSignedUrl;
    archive(id: string, userId: string): Promise<{
        message: string;
    }>;
    restore(id: string, userId: string): Promise<{
        message: string;
    }>;
    getActivityLog(candidateId: string): Promise<({
        user: {
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
    private logActivity;
    getCvSources(): Promise<{
        id: string;
        name: string;
    }[]>;
}
