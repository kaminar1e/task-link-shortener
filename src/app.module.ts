import { Module } from '@nestjs/common';
import { ShortenController } from 'src/api/controllers/shorten.controller';
import { RedisCacheModule } from 'src/api/redis.module';
import { LimitingService } from 'src/api/services/limiting.service';
import { MongodbService } from 'src/api/services/mongodb.service';
import { ShortcodeService } from 'src/api/services/shortcode.service';
import { Redis } from 'ioredis';
@Module({
  imports: [RedisCacheModule],
  controllers: [ShortenController],
  providers: [LimitingService, MongodbService, ShortcodeService, Redis],
})
export class AppModule {}
