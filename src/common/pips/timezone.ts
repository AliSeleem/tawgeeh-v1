// date-timezone.pipe.ts
import { PipeTransform, Injectable } from '@nestjs/common';
import { toZonedTime } from 'date-fns-tz';

@Injectable()
export class CairoDatePipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === 'string' && !isNaN(Date.parse(value))) {
      const utcDate = new Date(value);
      return toZonedTime(utcDate, 'Africa/Cairo');
    }
    return value;
  }
}
