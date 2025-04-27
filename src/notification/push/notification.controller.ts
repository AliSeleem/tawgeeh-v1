import { Controller, Sse, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PushService } from './push.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly pushService: PushService) {}

  @Sse('stream')
  streamNotifications(@Query('userId') userId: number): Observable<any> {
    if (!userId) {
      throw new Error('userId is required');
    }

    // Get the user's notification channel
    const userSubject = this.pushService.getSubject(userId);

    // Send any missed notifications
    this.pushService.sendMissedNotifications(userId).catch((err) => {
      console.error('Error sending missed notifications:', err);
    });

    // Stream notifications to the client
    return new Observable((observer) => {
      userSubject.subscribe({
        next: (data) => {
          observer.next({ event: 'notification', data });
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });

      // Clean up when the client disconnects
      return () => {
        this.pushService.cleanup(userId);
      };
    });
  }
}
