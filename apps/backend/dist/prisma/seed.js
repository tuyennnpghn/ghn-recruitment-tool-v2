"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const adminPassword = await bcrypt.hash('Admin@GHN2026!', 10);
    await prisma.user.upsert({
        where: { email: 'admin@ghn.vn' },
        update: {},
        create: {
            email: 'admin@ghn.vn',
            password: adminPassword,
            fullName: 'Admin System',
            role: 'admin',
            isActive: true,
        },
    });
    console.log('✅ Admin user created: admin@ghn.vn / Admin@GHN2026!');
    const departments = [
        { code: 'CEO', name: 'CEO Office' },
        { code: 'FIN', name: 'Finance' },
        { code: 'HRD', name: 'Human Resources' },
        { code: 'LEG', name: 'Legal & Compliance' },
        { code: 'MKT', name: 'Marketing' },
        { code: 'OPS', name: 'Operations' },
        { code: 'PRO', name: 'Product' },
        { code: 'SAL', name: 'Sales' },
        { code: 'SME', name: 'SME' },
        { code: 'TEC', name: 'Technology' },
        { code: 'DAT', name: 'Data & Analytics' },
        { code: 'CSX', name: 'Customer Experience' },
        { code: 'LOG', name: 'Logistics' },
        { code: 'FIN2', name: 'Finance - Accounting' },
        { code: 'ADM', name: 'Admin' },
        { code: 'PJT', name: 'Project Management' },
        { code: 'INF', name: 'Infrastructure' },
    ];
    for (const dept of departments) {
        await prisma.department.upsert({
            where: { code: dept.code },
            update: { name: dept.name },
            create: dept,
        });
    }
    console.log(`✅ ${departments.length} departments seeded`);
    const levels = [
        { name: 'Level C', leadTimeDays: 120 },
        { name: 'Director', leadTimeDays: 90 },
        { name: 'Senior Manager', leadTimeDays: 60 },
        { name: 'Manager', leadTimeDays: 50 },
        { name: 'Consultant (Project-based)', leadTimeDays: null },
        { name: 'Expert', leadTimeDays: 40 },
        { name: 'Supervisor', leadTimeDays: 35 },
        { name: 'Senior Specialist', leadTimeDays: 35 },
        { name: 'Team Leader', leadTimeDays: 35 },
        { name: 'Specialist', leadTimeDays: 30 },
        { name: 'Executive', leadTimeDays: 30 },
        { name: 'Officer', leadTimeDays: 22 },
        { name: 'Intern', leadTimeDays: 15 },
        { name: 'Staff', leadTimeDays: 17 },
        { name: 'Freelancer', leadTimeDays: 7 },
        { name: 'Engineer 1', leadTimeDays: 30 },
        { name: 'Engineer 2', leadTimeDays: 30 },
        { name: 'Engineer 3', leadTimeDays: 30 },
        { name: 'Senior Engineer 1', leadTimeDays: 35 },
        { name: 'Senior Engineer 2', leadTimeDays: 35 },
        { name: 'Senior Engineer 3', leadTimeDays: 45 },
        { name: 'Associate Lead Engineer', leadTimeDays: 50 },
        { name: 'Lead Engineer 1', leadTimeDays: 60 },
        { name: 'Lead Engineer 2', leadTimeDays: 60 },
        { name: 'Senior Lead Engineer 1', leadTimeDays: 70 },
    ];
    for (const level of levels) {
        await prisma.level.upsert({
            where: { name: level.name },
            update: { leadTimeDays: level.leadTimeDays },
            create: level,
        });
    }
    console.log(`✅ ${levels.length} levels seeded (Consultant = NULL = N/A)`);
    const tracks = ['Product', 'Technology', 'SME', 'Operations', 'Corporate', 'Sales', 'Data'];
    const subTracks = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Data Engineering', 'QA', 'Design'];
    for (const name of tracks) {
        await prisma.track.upsert({ where: { name }, update: {}, create: { name } });
    }
    for (const name of subTracks) {
        await prisma.subTrack.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log(`✅ ${tracks.length} tracks + ${subTracks.length} sub-tracks seeded`);
    const cvSources = [
        'Facebook Post', 'Threads Post',
        'Vietnamworks Post', 'Vietnamworks Search',
        'TopCV Post Co Phi', 'TopCV Post Ko Phi', 'TopCV Search',
        'Vieclam24h Post', 'Vieclam24h Search',
        'Ybox Post', 'Glints Post', 'Glints Search',
        'ITviec Post', 'Joboko', 'Zalo Tim Viec',
        'LinkedIn Corp Post', 'LinkedIn Corp Search',
        'LinkedIn Personal Post', 'LinkedIn Personal Search',
        'GHN Career Site',
        'Normal Referral', 'Direct Referral', 'Program (GTNB)',
        'Personal Hunting', 'Headhunt Agency',
        'Internal Database', 'Internal Movement',
        'Other',
    ];
    for (const name of cvSources) {
        await prisma.cvSource.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log(`✅ ${cvSources.length} CV sources seeded`);
    const holidays2026 = [
        { date: '2026-01-01', desc: "Tết Dương Lịch" },
        { date: '2026-01-26', desc: "Tết Nguyên Đán (26/01)" },
        { date: '2026-01-27', desc: "Tết Nguyên Đán (27/01)" },
        { date: '2026-01-28', desc: "Tết Nguyên Đán (28/01)" },
        { date: '2026-01-29', desc: "Tết Nguyên Đán (29/01)" },
        { date: '2026-01-30', desc: "Tết Nguyên Đán (30/01)" },
        { date: '2026-04-07', desc: "Giỗ Tổ Hùng Vương (mùng 10/3 âm lịch)" },
        { date: '2026-04-30', desc: "Ngày Giải Phóng Miền Nam" },
        { date: '2026-05-01', desc: "Ngày Quốc Tế Lao Động" },
        { date: '2026-09-02', desc: "Ngày Quốc Khánh" },
        { date: '2026-09-03', desc: "Ngày Quốc Khánh (nghỉ bù)" },
    ];
    for (const h of holidays2026) {
        await prisma.holidayCalendar.upsert({
            where: { holidayDate: new Date(h.date) },
            update: { description: h.desc },
            create: { holidayDate: new Date(h.date), description: h.desc },
        });
    }
    console.log(`✅ ${holidays2026.length} holidays 2026 seeded`);
    const deptMap = Object.fromEntries((await prisma.department.findMany()).map((d) => [d.code, d.id]));
    const sGradeMappings = [
        ['SAL', 'Field Sales Executive', 'S1'],
        ['HRD', 'HRBP Executive', 'S1'],
        ['SME', 'SME Operations Executive', 'S1'],
        ['SAL', 'Telesales Executive', 'S1'],
        ['HRD', 'C&B Officer', 'S1'],
        ['ADM', 'Office Admin Officer', 'S1'],
        ['FIN', 'Accounts Payable Executive', 'S1'],
        ['FIN', 'Accounts Payable Specialist', 'S2'],
        ['DAT', 'Business Analyst', 'S2'],
        ['DAT', 'Data Analyst', 'S2'],
        ['DAT', 'Data Engineer', 'S2'],
        ['TEC', 'Software Engineer', 'S2'],
        ['PRO', 'Product Designer', 'S2'],
        ['HRD', 'HRBP Specialist', 'S2'],
        ['TEC', 'Engineer 1', 'S2'],
        ['TEC', 'Engineer 2', 'S2'],
        ['FIN', 'Accounts Receivable Supervisor', 'S3'],
        ['OPS', 'Customer Support TL', 'S3'],
        ['SAL', 'Senior Partnership Specialist', 'S3'],
        ['TEC', 'Senior Engineer 1', 'S3'],
        ['TEC', 'Senior Engineer 2', 'S3'],
        ['FIN', 'Accounts Payable Manager', 'S4'],
        ['HRD', 'HRBP Manager', 'S4'],
        ['TEC', 'Engineering Manager', 'S4'],
        ['PRO', 'Product Manager', 'S4'],
        ['TEC', 'Senior Engineering Manager', 'S5'],
        ['PRO', 'Senior Product Manager', 'S5'],
        ['TEC', 'Technology Director', 'S6'],
        ['PRO', 'Product Director', 'S6'],
        ['HRD', 'HR Director', 'S6'],
        ['CEO', 'Vice President', 'S7'],
        ['CEO', 'Chief Technology Officer', 'S8'],
        ['CEO', 'Chief Product Officer', 'S8'],
    ];
    let jtCount = 0;
    for (const [deptCode, title, sGrade] of sGradeMappings) {
        const deptId = deptMap[deptCode];
        if (!deptId)
            continue;
        await prisma.jobTitle.upsert({
            where: { departmentId_title: { departmentId: deptId, title } },
            update: { sGrade },
            create: { departmentId: deptId, title, sGrade },
        });
        jtCount++;
    }
    console.log(`✅ ${jtCount} job title → S-Grade mappings seeded (sample)`);
    console.log('   ⚠️  Full 211 entries should be imported via Admin Import UI');
    const reqCvSources = [
        'Facebook Post', 'Vietnamworks Post', 'LinkedIn Corp Post',
        'TopCV Post Có Phí', 'TopCV Post Ko Phí', 'Vieclam24h Post',
        'GHN Career Site', 'Glints Post', 'Ybox Post', 'Joboko Post',
        'Zalo Tìm Việc Post', 'LinkedIn Personal Post', 'ITViec Post',
        'Vietnamworks Search', 'LinkedIn Corp Search', 'TopCV Search',
        'Vieclam24h Search', 'LinkedIn Personal Search', 'Glints Search',
        'Headhunt agency', 'Personal hunting', 'Internal Database',
        'Facebook', 'Threads', 'Direct Referral', 'Normal Referral',
        'Other', 'Internal Movement', 'Promotion',
        'Vieclamtot Post Có Phí', 'Vieclamtot Post Ko Phí',
        'Referral Program',
    ];
    for (const name of reqCvSources) {
        await prisma.cvSource.upsert({ where: { name }, update: {}, create: { name } });
    }
    console.log(`✅ ${reqCvSources.length} CV source entries ensured (exact names)`);
    const reqLevels = [
        'Associate Lead Engineer', 'Engineer 1', 'Engineer 2',
        'Engineer 3', 'Lead Engineer 1', 'Lead Engineer 2',
        'Senior Specialist', 'Senior Engineer 1', 'Senior Engineer 2',
        'Senior Engineer 3', 'Intern', 'Specialist', 'Manager',
        'Executive', 'Team Leader', 'Officer', 'Freelancer',
        'Supervisor', 'Staff', 'Senior Manager', 'Expert', 'Director',
    ];
    for (const name of reqLevels) {
        await prisma.level.upsert({ where: { name }, update: {}, create: { name, leadTimeDays: null } });
    }
    console.log(`✅ ${reqLevels.length} level entries ensured (exact names)`);
    const newDepts = [
        { code: 'EV', name: 'EV Project' },
        { code: 'IAD', name: 'Internal Audit' },
        { code: 'PUR', name: 'Purchasing' },
    ];
    for (const d of newDepts) {
        await prisma.department.upsert({
            where: { code: d.code },
            update: { name: d.name },
            create: { code: d.code, name: d.name },
        });
    }
    console.log('✅ 3 new departments seeded');
    const jobTitleData = [
        { dept: 'Finance - Accounting', title: 'Accounts Payable Executive', sGrade: 'S1' },
        { dept: 'Finance - Accounting', title: 'Accounts Payable Manager', sGrade: 'S4' },
        { dept: 'Finance - Accounting', title: 'Accounts Payable Specialist', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'Accounts Receivable Executive', sGrade: 'S1' },
        { dept: 'Finance - Accounting', title: 'Accounts Receivable Specialist', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'Accounts Receivable Supervisor', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Cash Management Executive', sGrade: 'S1' },
        { dept: 'Finance - Accounting', title: 'Cash Management Specialist', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'Cash Management Team Leader', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'COD Accounts Receivable Executive', sGrade: 'S1' },
        { dept: 'Finance - Accounting', title: 'COD Accounts Receivable Specialist', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'COD Accounts Receivable Team Leader', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Customer Accounts Receivable Executive', sGrade: 'S1' },
        { dept: 'Finance - Accounting', title: 'Customer Accounts Receivable Specialist', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'Customer Accounts Receivable Supervisor', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Customer Accounts Receivable Team Leader', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Fixed Assets Accountant', sGrade: 'S2' },
        { dept: 'Finance - Accounting', title: 'General Accountant', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Senior Accounting Manager', sGrade: 'S7' },
        { dept: 'Finance - Accounting', title: 'Senior Accounts Payable Specialist', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Senior Accounts Receivable Specialist', sGrade: 'S3' },
        { dept: 'Finance - Accounting', title: 'Senior General Accountant', sGrade: 'S4' },
        { dept: 'Infrastructure', title: 'Asset Manager - M&E', sGrade: 'S5' },
        { dept: 'Infrastructure', title: 'Asset Supervisor- Fleet', sGrade: 'S4' },
        { dept: 'Infrastructure', title: 'Procurement Executive', sGrade: 'S1' },
        { dept: 'Infrastructure', title: 'Procurement Specialist', sGrade: 'S3' },
        { dept: 'Sales', title: 'Big Clients Account Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Big Clients Account Specialist', sGrade: 'S1' },
        { dept: 'Sales', title: 'Business Development Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Big Clients Account Manager', sGrade: 'S5' },
        { dept: 'Sales', title: 'Business Develoment Manager', sGrade: 'S5' },
        { dept: 'Operations', title: 'Senior Customer Support C2C Specialist', sGrade: null },
        { dept: 'Operations', title: 'Acting Telesales Team Leader', sGrade: 'S2' },
        { dept: 'Operations', title: 'Call Center Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Call Center Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Claim Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Content Specialist', sGrade: 'S2' },
        { dept: 'Operations', title: 'Customer Services Supervisor', sGrade: 'S4' },
        { dept: 'Operations', title: 'Customer Support Team Leader', sGrade: 'S3' },
        { dept: 'Operations', title: 'Digital Marketing Specialist', sGrade: 'S2' },
        { dept: 'Operations', title: 'Gamification Specialist', sGrade: null },
        { dept: 'Operations', title: 'Graphic Designer Specialist', sGrade: 'S2' },
        { dept: 'Operations', title: 'Growth Enablement Team Leader', sGrade: 'S3' },
        { dept: 'Operations', title: 'Head of C2C', sGrade: 'S7' },
        { dept: 'Operations', title: 'Internal Support Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Internal Support Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Partnership Specialist', sGrade: 'S2' },
        { dept: 'Operations', title: 'Partnership Support Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Partnership Support Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Performance Marketing Team Leader', sGrade: 'S4' },
        { dept: 'Operations', title: 'Senior Partnership Specialist', sGrade: 'S3' },
        { dept: 'Operations', title: 'Social Media Support Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Social Media Support Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Special Support Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Special Support Specialist', sGrade: 'S1' },
        { dept: 'Operations', title: 'Telesales Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Telesales Supervisor', sGrade: 'S4' },
        { dept: 'Operations', title: 'Telesales Team Leader', sGrade: 'S3' },
        { dept: 'SME', title: 'Category Manager', sGrade: 'S5' },
        { dept: 'SME', title: 'Senior Business Operations & Data Specialist', sGrade: 'S4' },
        { dept: 'SME', title: 'Acting SME Business Development Director', sGrade: 'S8' },
        { dept: 'SME', title: 'Category Executive', sGrade: 'S2' },
        { dept: 'SME', title: 'Category Management Executive', sGrade: 'S2' },
        { dept: 'SME', title: 'Category Specialist', sGrade: 'S3' },
        { dept: 'SME', title: 'Pricing & Sales Planning Manager', sGrade: 'S6' },
        { dept: 'CEO Office', title: 'Business Analyst', sGrade: 'S2' },
        { dept: 'CEO Office', title: 'Corporate Strategy & CEO Office', sGrade: 'S7' },
        { dept: 'Data & Analytics', title: 'Associate Data Engineering Manager', sGrade: 'S5' },
        { dept: 'Data & Analytics', title: 'Data Analyst', sGrade: 'S2' },
        { dept: 'Data & Analytics', title: 'Data Engineer', sGrade: 'S2' },
        { dept: 'Data & Analytics', title: 'Data Scientist', sGrade: 'S2' },
        { dept: 'Data & Analytics', title: 'Lead Data Analyst', sGrade: 'S4' },
        { dept: 'Data & Analytics', title: 'Senior Business Analyst', sGrade: 'S3' },
        { dept: 'Data & Analytics', title: 'Senior Data Analyst', sGrade: 'S3' },
        { dept: 'Data & Analytics', title: 'Senior Data Engineer', sGrade: 'S3' },
        { dept: 'Data & Analytics', title: 'Senior Data Scientist', sGrade: 'S3' },
        { dept: 'Data & Analytics', title: 'Staff Data Engineer', sGrade: 'S4' },
        { dept: 'Customer Experience', title: 'Customer Experience Executive', sGrade: 'S1' },
        { dept: 'Customer Experience', title: 'Customer Experience Expert', sGrade: 'S5' },
        { dept: 'Customer Experience', title: 'Customer Experience Specialist', sGrade: 'S2' },
        { dept: 'Customer Experience', title: 'Customer Intelligence Executive', sGrade: 'S1' },
        { dept: 'Customer Experience', title: 'Customer Intelligence Specialist', sGrade: 'S3' },
        { dept: 'Customer Experience', title: 'Data Analyst', sGrade: 'S2' },
        { dept: 'Customer Experience', title: 'Head of Customer Experience', sGrade: 'S6' },
        { dept: 'Customer Experience', title: 'Head of Customer Happiness', sGrade: null },
        { dept: 'Customer Experience', title: 'Process Assurance Executive', sGrade: 'S1' },
        { dept: 'Customer Experience', title: 'Process Assurance Specialist', sGrade: 'S2' },
        { dept: 'Customer Experience', title: 'Process Assurance Supervisor', sGrade: null },
        { dept: 'Customer Experience', title: 'Quality Control Specialist', sGrade: 'S2' },
        { dept: 'Customer Experience', title: 'Senior Data Analyst', sGrade: 'S3' },
        { dept: 'Customer Experience', title: 'Touchpoint Control Executive', sGrade: 'S1' },
        { dept: 'Customer Experience', title: 'Touchpoint Control Manager', sGrade: 'S4' },
        { dept: 'Customer Experience', title: 'Touchpoint Control Specialist', sGrade: 'S2' },
        { dept: 'Operations', title: 'Claim Team Leader', sGrade: 'S3' },
        { dept: 'Operations', title: 'Customer Services B2C Executive', sGrade: 'S1' },
        { dept: 'Operations', title: 'Customer Services B2C Supervisor', sGrade: 'S4' },
        { dept: 'Operations', title: 'Customer Services B2C Team Leader', sGrade: 'S3' },
        { dept: 'Operations', title: 'Senior Claim Specialist', sGrade: null },
        { dept: 'Operations', title: 'Senior Customer Services B2C Manager', sGrade: null },
        { dept: 'Operations', title: 'Senior Customer Services B2C Specialist', sGrade: null },
        { dept: 'Operations', title: 'Claim Executive', sGrade: 'S1' },
        { dept: 'Human Resources', title: 'Employee Experience Platform Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Acting Field Sales Team Leader', sGrade: 'S2' },
        { dept: 'Sales', title: 'Acting Senior Business Development Manager', sGrade: 'S5' },
        { dept: 'Sales', title: 'Acting Senior Field Sales Manager', sGrade: 'S5' },
        { dept: 'Sales', title: 'Business Development Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Business Development Manager', sGrade: 'S5' },
        { dept: 'Sales', title: 'Customer Services B2C Specialist', sGrade: 'S1' },
        { dept: 'Sales', title: 'Field Sales Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Field Sales Intern', sGrade: 'S1' },
        { dept: 'Sales', title: 'Field Sales Manager', sGrade: 'S5' },
        { dept: 'Sales', title: 'Field Sales Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Field Sales Trainee', sGrade: null },
        { dept: 'Sales', title: 'Sale Admin Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Senior Business Development Specialist', sGrade: 'S3' },
        { dept: 'Sales', title: 'Senior Field Sale Specialist', sGrade: 'S3' },
        { dept: 'Finance', title: 'Finance Manager', sGrade: 'S6' },
        { dept: 'Finance', title: 'Financial Planning & Analysis Manager', sGrade: null },
        { dept: 'Finance', title: 'Financial System & Analysis Supervisor', sGrade: null },
        { dept: 'Finance', title: 'Senior Investment Manager', sGrade: 'S7' },
        { dept: 'Finance', title: 'Financial Planning & Analysis Specialist', sGrade: 'S3' },
        { dept: 'Finance', title: 'Financial Planning & Analysis Supervisor', sGrade: 'S5' },
        { dept: 'Finance', title: 'Senior Financial Planning & Analysis Specialist', sGrade: 'S4' },
        { dept: 'Internal Audit', title: 'Internal Audit Specialist', sGrade: 'S3' },
        { dept: 'Internal Audit', title: 'Internal Audit Supervisor', sGrade: 'S5' },
        { dept: 'Internal Audit', title: 'Internal Audit Team Leader', sGrade: 'S4' },
        { dept: 'Internal Audit', title: 'Internal Control Executive', sGrade: 'S2' },
        { dept: 'Sales', title: 'Strategic Project Lead', sGrade: 'S4' },
        { dept: 'Sales', title: 'Key Account Care Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Key Account Care Leader', sGrade: 'S3' },
        { dept: 'Sales', title: 'Key Account Care Officer', sGrade: 'S1' },
        { dept: 'Sales', title: 'Key Account Care Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Key Account Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Key Account Manager', sGrade: 'S6' },
        { dept: 'Sales', title: 'Key Account Solutions Executive', sGrade: 'S1' },
        { dept: 'Sales', title: 'Key Account Specialist', sGrade: 'S2' },
        { dept: 'Sales', title: 'Key Account Team Leader', sGrade: 'S3' },
        { dept: 'Legal & Compliance', title: 'Legal Executive', sGrade: 'S1' },
        { dept: 'Legal & Compliance', title: 'Legal Manager', sGrade: 'S5' },
        { dept: 'Legal & Compliance', title: 'Legal Senior Specialist', sGrade: 'S3' },
        { dept: 'Legal & Compliance', title: 'Legal Specialist', sGrade: 'S2' },
        { dept: 'Marketing', title: 'Brand Specialist', sGrade: 'S2' },
        { dept: 'Marketing', title: 'Community Management Specialist', sGrade: 'S2' },
        { dept: 'Marketing', title: 'Content Officer', sGrade: null },
        { dept: 'Marketing', title: 'Creative Producer', sGrade: 'S1' },
        { dept: 'Marketing', title: 'Graphic Designs Specialist', sGrade: 'S2' },
        { dept: 'Marketing', title: 'Marketing Manager', sGrade: 'S6' },
        { dept: 'Marketing', title: 'Trade Marketing Specialist', sGrade: 'S2' },
        { dept: 'Marketing', title: 'Trade Marketing Supervisor', sGrade: null },
        { dept: 'Product', title: 'Product Design Lead', sGrade: 'S5' },
        { dept: 'Product', title: 'Product Design Manager', sGrade: 'S6' },
        { dept: 'Product', title: 'Product Designer', sGrade: 'S2' },
        { dept: 'Product', title: 'Product Lead', sGrade: 'S5' },
        { dept: 'Product', title: 'Product Manager', sGrade: 'S6' },
        { dept: 'Product', title: 'Product Owner 1', sGrade: 'S1' },
        { dept: 'Product', title: 'Product Owner 2', sGrade: 'S2' },
        { dept: 'Product', title: 'Senior AI Product Manager', sGrade: 'S7' },
        { dept: 'Product', title: 'Senior AI Product Owner 1', sGrade: 'S3' },
        { dept: 'Product', title: 'Senior Product Designer 1', sGrade: 'S3' },
        { dept: 'Product', title: 'Senior Product Designer 2', sGrade: 'S4' },
        { dept: 'Product', title: 'Senior Product Manager', sGrade: 'S7' },
        { dept: 'Product', title: 'Senior Product Owner 1', sGrade: 'S3' },
        { dept: 'Product', title: 'Senior Product Owner 2', sGrade: 'S4' },
        { dept: 'Purchasing', title: 'Mechanical & Electrical Manager', sGrade: 'S5' },
        { dept: 'Purchasing', title: 'Purchasing Executive', sGrade: 'S1' },
        { dept: 'Purchasing', title: 'Purchasing Specialist', sGrade: 'S3' },
        { dept: 'Purchasing', title: 'Senior Purchasing Specialist', sGrade: 'S4' },
        { dept: 'Purchasing', title: 'Truck Manager', sGrade: 'S5' },
        { dept: 'Human Resources', title: 'Succession Analyst & Data Specialist', sGrade: null },
        { dept: 'Human Resources', title: 'Talent Development Specialist', sGrade: 'S2' },
        { dept: 'Technology', title: 'Agile Coach', sGrade: 'S6' },
        { dept: 'Technology', title: 'Associate Software Manager', sGrade: 'S5' },
        { dept: 'Technology', title: 'Head of Quality Engineering', sGrade: 'S7' },
        { dept: 'Technology', title: 'Head of Technical Operation & DevOps', sGrade: 'S7' },
        { dept: 'Technology', title: 'IT Manager', sGrade: 'S6' },
        { dept: 'Technology', title: 'Principal Quality Engineer', sGrade: 'S7' },
        { dept: 'Technology', title: 'Principal Software Engineer', sGrade: 'S6' },
        { dept: 'Technology', title: 'Product Design Manager', sGrade: 'S6' },
        { dept: 'Technology', title: 'Quality Engineer', sGrade: 'S2' },
        { dept: 'Technology', title: 'Scrum Master', sGrade: 'S4' },
        { dept: 'Technology', title: 'Senior DevOps Engineer', sGrade: 'S3' },
        { dept: 'Technology', title: 'Senior Quality Engineer', sGrade: 'S3' },
        { dept: 'Technology', title: 'Senior Software Engineer', sGrade: 'S3' },
        { dept: 'Technology', title: 'Senior Software Manager', sGrade: 'S7' },
        { dept: 'Technology', title: 'Senior Staff Quality Engineer', sGrade: 'S5' },
        { dept: 'Technology', title: 'Senior Staff Software Engineer', sGrade: 'S5' },
        { dept: 'Technology', title: 'Software Engineer', sGrade: 'S2' },
        { dept: 'Technology', title: 'Staff Quality Engineer', sGrade: 'S4' },
        { dept: 'Technology', title: 'Staff Software Engineer', sGrade: 'S4' },
        { dept: 'Technology', title: 'Staff Technical Operation', sGrade: 'S4' },
        { dept: 'Technology', title: 'Technical Operation Engineer', sGrade: 'S2' },
        { dept: 'Data & Analytics', title: 'Associate Data Science Manager', sGrade: 'S5' },
        { dept: 'Data & Analytics', title: 'Senior DataOps Engineer', sGrade: 'S3' },
        { dept: 'EV Project', title: 'Project Director - EV Project', sGrade: 'S8' },
    ];
    const deptRows = await prisma.department.findMany({ select: { id: true, name: true } });
    const deptIdMap = Object.fromEntries(deptRows.map((d) => [d.name, d.id]));
    let jtCreated = 0, jtSkipped = 0;
    for (const jt of jobTitleData) {
        const departmentId = deptIdMap[jt.dept];
        if (!departmentId) {
            console.warn(`  ⚠️ Dept not found: ${jt.dept}`);
            jtSkipped++;
            continue;
        }
        await prisma.jobTitle.upsert({
            where: { departmentId_title: { departmentId, title: jt.title } },
            update: { sGrade: jt.sGrade },
            create: { departmentId, title: jt.title, sGrade: jt.sGrade },
        });
        jtCreated++;
    }
    console.log(`✅ ${jtCreated} job titles seeded, ${jtSkipped} skipped`);
    console.log('\n🎉 Seed complete! You can now log in with:');
    console.log('   Email:    admin@ghn.vn');
    console.log('   Password: Admin@GHN2026!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map