import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_URL || 'NO REDIS URL',
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD || 'NO REDIS PASSWORD',
          username: process.env.REDIS_USER || 'NO REDIS USERNAME'
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisCacheModule { }