import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RequestModule } from './request/request.module';
import { CandidateModule } from './candidate/candidate.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ── Rate Limiting ──────────────────────────────────────────────────────
    // Apply per-IP rate limits to every public endpoint.
    // Stricter limits for auth endpoints are applied via @Throttle() decorator.
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000, // convert seconds → ms
        limit: Number(process.env.THROTTLE_LIMIT ?? 100),
      },
    ]),
    PrismaModule,
    AuthModule,
    RequestModule,
    CandidateModule,
    PipelineModule,
    AdminModule,
  ],
  providers: [
    // Register ThrottlerGuard globally — applies to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

