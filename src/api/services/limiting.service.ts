import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class LimitingService implements OnModuleInit, OnModuleDestroy {
    redis: Redis
    async onModuleInit() {
        const client = await new Redis(process.env.REDISCLOUD_URL);
        client.on('connect', () => {
            console.log('CONNECTED FROM LIMITING SERVICE');
        });
        this.redis = client;
    }

    async onModuleDestroy() {
        await this.redis.quit();
    }
    constructor() { }
    limit = 10;
    ttl = 60;
    async checkLimit(ip: string): Promise<boolean> {
        const requestsCount = await this.redis.incr(ip);
        if (requestsCount === 1) await this.redis.expire(ip, this.ttl);
        if (requestsCount > this.limit) return false;
        else return true;
    }
}
