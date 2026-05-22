import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: false,
      transform: true, // auto-transform query params to declared types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 🛠️ CẤU HÌNH PORT & HOST ĐỂ CHẠY TRÊN CLOUD (RENDER)
  const port = parseInt(process.env.PORT ?? '3000', 10);
  
  // Ép NestJS bind vào host '0.0.0.0' thay vì ngầm định localhost
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend running on port ${port} via 0.0.0.0`);
  console.log(`🌍 API Base Path: http://0.0.0.0:${port}/api/v1`);
}

// 🟢 BỘ BỌC LỖI TOÀN CỤC: Nếu sập vì lỗi Database/Prisma lúc khởi động, 
// nó sẽ ép hệ thống in sạch log lỗi ra màn hình Render thay vì im lặng chết.
bootstrap().catch((err) => {
  console.error('🔥 CRITICAL BOOTSTRAP ERROR DURING STARTUP:', err);
  process.exit(1);
});