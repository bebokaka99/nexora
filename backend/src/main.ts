import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('NEXORA-Bootstrap');

  // TASK-009 fail-fast: dừng khởi động ngay khi thiếu DATABASE_URL,
  // thay vì chạy backend bằng dữ liệu giả (fallback in-memory).
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'NEXORA Backend không thể khởi động: thiếu biến môi trường DATABASE_URL. ' +
        'Đặt DATABASE_URL trỏ tới PostgreSQL đã chạy migration 0001_init ' +
        '(VD: postgresql://nexora:nexora@localhost:5432/nexora).',
    );
  }

  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 4000;
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const swaggerPath = process.env.SWAGGER_PATH || 'docs';

  // 1. Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // 2. Global CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // 3. Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Global Interceptors & Filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5. OpenAPI / Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('NEXORA — Commerce Management Platform API')
    .setDescription(
      'Tài liệu OpenAPI / Swagger chính thức của hệ thống NEXORA Modular Monolith Backend. Phục vụ quản trị bán lẻ đa kênh, POS, Quản lý kho, Sàn TMĐT và Hội thoại.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập JWT Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Kiểm tra trạng thái hệ thống')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'NEXORA API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(port);
  logger.log(`🚀 NEXORA Backend server is running at: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📖 Swagger API Documentation is available at: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();
