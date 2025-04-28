import { Injectable } from '@nestjs/common';
// import { NotificationChannel } from './notification.interface';
import { NotificationStorageService } from './notification-storage.service';
import { Subject } from 'rxjs';
import { Notification } from '@prisma/client';

@Injectable()
export class PushService {
  //implements NotificationChannel
  private userNotifications: Map<number, Subject<any>> = new Map();

  constructor(private readonly storageService: NotificationStorageService) {}

  // Get a Subject for sending notifications to a user
  getSubject(userId: number): Subject<any> {
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, new Subject<any>());
    }
    return this.userNotifications.get(userId)!;
  }

  // Send a notification to a user
  async send(userId: number, subject: string, content: string): Promise<void> {
    const userSubject = this.userNotifications.get(userId);
    if (!userSubject) {
      // User is offline, store the notification
      await this.storageService.storeNotification(userId, subject, content);
      return;
    }

    // Send the notification
    userSubject.next({ subject, content });
  }

  // Send missed notifications when a user connects
  async sendMissedNotifications(userId: number): Promise<void> {
    const userSubject = this.getSubject(userId);

    const missedNotifications: Notification[] =
      await this.storageService.getUndeliveredNotifications(userId);
    console.log('missedNotifications', missedNotifications);
    for (const notification of missedNotifications) {
      userSubject.next({
        subject: notification.title,
        content: notification.body,
      });
      await this.storageService.markAsDelivered(notification.id);
    }
  }

  // Clean up when a user disconnects
  cleanup(userId: number): void {
    this.userNotifications.delete(userId);
  }
}
