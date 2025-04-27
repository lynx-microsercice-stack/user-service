import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiClientService } from './services/api-client.service';
import { RedisService } from './services/redis.service';
import { ApiEndpoints } from './utils/api-endpoint.util';
@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [ApiClientService, ApiEndpoints, RedisService],
  exports: [ApiClientService, ApiEndpoints, RedisService],
})
export class SharedModule {}
