import { Redis } from 'ioredis';

export class RateLimiter {
  private redis: Redis | null;
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private isRedisConnected: boolean = false;

  constructor() {
    try {
      this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        connectTimeout: 1000,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      
      this.redis.on('connect', () => {
        console.log('✅ Redis connected for rate limiting');
        this.isRedisConnected = true;
      });
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.redis.on('error', (_error) => {
        console.log('⚠️  Redis not available, rate limiting disabled');
        this.isRedisConnected = false;
      });
    } catch {
      console.log('⚠️  Redis initialization failed, rate limiting disabled');
      this.redis = null;
    }
    
    this.windowMs = 60 * 1000; // 1 minute
    this.maxRequests = 10; // 10 requests per minute
  }

  async isRateLimited(ip: string): Promise<boolean> {
    if (!this.redis || !this.isRedisConnected) {
      // No Redis available - allow all requests
      return false;
    }

    const key = `rate-limit:${ip}`;
    
    try {
      // Get current count
      const count = await this.redis.get(key);
      
      if (!count) {
        // First request in the window
        await this.redis.set(key, 1, 'PX', this.windowMs);
        return false;
      }

      const currentCount = parseInt(count, 10);
      
      if (currentCount >= this.maxRequests) {
        return true;
      }

      // Increment count
      await this.redis.incr(key);
      return false;
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return false;
    }
  }

  async getRemainingRequests(ip: string): Promise<number> {
    if (!this.redis || !this.isRedisConnected) {
      // No Redis available - return max requests
      return this.maxRequests;
    }

    const key = `rate-limit:${ip}`;
    try {
      const count = await this.redis.get(key);
      return count ? Math.max(0, this.maxRequests - parseInt(count, 10)) : this.maxRequests;
    } catch (error) {
      console.error('Error getting remaining requests:', error);
      return this.maxRequests;
    }
  }
} 