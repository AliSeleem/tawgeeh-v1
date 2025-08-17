// date-timezone.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { formatInTimeZone } from 'date-fns-tz';
import { Observable } from 'rxjs';

@Injectable()
export class CairoDateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertDatesToCairo(data)));
  }

  private convertDatesToCairo(obj: any): any {
    if (obj instanceof Date) {
      return formatInTimeZone(obj, 'Africa/Cairo', "yyyy-MM-dd'T'HH:mm:ssXXX");
    } else if (Array.isArray(obj)) {
      return obj.map((item) => this.convertDatesToCairo(item));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = this.convertDatesToCairo(obj[key]);
      }
      return newObj;
    }
    return obj;
  }
}
