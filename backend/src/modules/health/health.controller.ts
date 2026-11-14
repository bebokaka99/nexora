import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái máy chủ NestJS' })
  @ApiResponse({ status: 200, description: 'Máy chủ hoạt động bình thường' })
  check() {
    return {
      status: 'ok',
      service: 'NEXORA Commerce Core API',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
