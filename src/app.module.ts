import { Module } from '@nestjs/common';
import { ShortenController } from 'src/api/controllers/shorten.controller';

import { LimitingService } from 'src/api/services/limiting.service';
import { MongodbService } from 'src/api/services/mongodb.service';
import { ShortcodeService } from 'src/api/services/shortcode.service';

@Module({
  imports: [],
  controllers: [ShortenController],
  providers: [LimitingService, MongodbService, ShortcodeService],
})
export class AppModule {}
