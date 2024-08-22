import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_URL,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          username: process.env.REDIS_USER
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisCacheModule { }