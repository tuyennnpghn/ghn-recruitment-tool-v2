import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
        };
    }>;
    getMe(user: {
        id: string;
    }): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    listUsers(): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: string;
    }[]>;
}
