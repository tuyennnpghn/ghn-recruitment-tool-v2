# GHN Recruitment Tool

Hệ thống quản lý tuyển dụng nội bộ cho team HRBP tại GiaoHangNhanh.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | NestJS (TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| File Storage | Supabase Private Bucket |

## Cài đặt

### Prerequisites
- Node.js >= 20
- npm >= 10

### 1. Cài dependencies

```bash
# Tại root
npm install
```

### 2. Cấu hình environment

```bash
cd apps/backend
cp .env.example .env
# Điền DATABASE_URL, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
```

### 3. Khởi tạo database

```bash
cd apps/backend
npm run db:migrate     # Chạy migrations
npm run db:seed        # Seed dữ liệu ban đầu
```

### 4. Chạy development

```bash
# Terminal 1 — Backend (port 3000)
cd apps/backend && npm run start:dev

# Terminal 2 — Frontend (port 5173)
cd apps/frontend && npm run dev
```

## Cấu trúc thư mục

```
ghn-recruitment-tool/
├── apps/
│   ├── backend/    # NestJS API
│   └── frontend/   # React SPA
└── packages/
    └── shared-types/   # Shared TypeScript types
```

## Tài khoản Admin mặc định (sau seed)

- **Email:** admin@ghn.vn
- **Password:** Admin@GHN2026!

> ⚠️ Đổi password ngay sau lần đầu đăng nhập.

## Sprint Plan

- **Sprint 1** ✅ Project setup, DB schema, Auth, Master Data, User Management
- **Sprint 2** 🔲 Request CRUD + Lead-time
- **Sprint 3** 🔲 Candidate Pool + Pipeline
- **Sprint 4** 🔲 Dashboard + Alert Cronjob + Export
- **Sprint 5** 🔲 Admin Import + Archive + Polish
