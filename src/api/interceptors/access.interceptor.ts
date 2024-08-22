import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class AccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();
        response.header('Access-Control-Allow-Origin', '*');
        const request = context.switchToHttp().getRequest();
        request.header('Access-Control-Allow-Origin', '*');
        return data;
      })
    );
  }
}
