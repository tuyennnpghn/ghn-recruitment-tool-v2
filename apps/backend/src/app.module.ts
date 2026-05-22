import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RequestModule } from './request/request.module';
import { CandidateModule } from './candidate/candidate.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RequestModule,
    CandidateModule,
    PipelineModule,
    AdminModule,
  ],
})
export class AppModule {}
