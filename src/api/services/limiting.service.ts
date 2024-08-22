import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';


@Injectable()
export class LimitingService {
    constructor(private readonly redis: Redis) {}
    limit = 10;
    ttl = 60;
    async checkLimit(ip: string): Promise<boolean> {
        const requestsCount = await this.redis.incr(ip);
        if (requestsCount === 1) await this.redis.expire(ip, this.ttl);
        if (requestsCount > this.limit) return false;
        else return true;
    }
}
