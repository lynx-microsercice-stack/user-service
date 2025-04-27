import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import configuration from 'src/config/configuration';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly defaultTtl = 3600; // 1 hour in seconds

  async onModuleInit() {
    this.redisClient = new Redis({
      host: configuration().redis.host,
      port: configuration().redis.port,
      password: configuration().redis.password,
      db: configuration().redis.db,
    });

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Store a technical token with an optional TTL
   */
  async storeToken(key: string, token: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, token, 'EX', ttl || this.defaultTtl);
  }

  /**
   * Retrieve a technical token
   */
  async getToken(key: string): Promise<string> {
    const token = await this.redisClient.get(key);
    if (!token) {
      throw new Error('Token not found');
    }
    return token;
  }

  /**
   * Delete a technical token
   */
  async removeToken(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * Check if a technical token exists
   */
  async hasToken(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }
}
