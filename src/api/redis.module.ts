import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
console.log(process.env.REDIS_URL);
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
          username: process.env.REDIS_USER || 'NO REDIS USERNAME',
          tls: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
          }
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})


export class RedisCacheModule { }