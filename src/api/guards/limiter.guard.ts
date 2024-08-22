import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { LimitingService } from '../services/limiting.service';

@Injectable()
export class LimiterGuard implements CanActivate {
  constructor(private readonly limitService: LimitingService) { };
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    return await this.limitService.checkLimit(ip);
  }
}
