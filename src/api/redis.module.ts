// import { Module, Global } from '@nestjs/common';
// import Redis from 'ioredis';


// @Global()
// @Module({

//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: () => {
//         return new Redis('redis://default:c7NwF3VVvEAEcm2JKZI42h9sXWWnZKtv@redis-10013.c244.us-east-1-2.ec2.redns.redis-cloud.com:10013');
//       },
//     },
//   ],
//   exports: ['REDIS_CLIENT'],
// })

// export class RedisCacheModule { }