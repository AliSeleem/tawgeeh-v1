import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { EmailType, NotificationType } from './enums/notification-type.enum';
import { PushService } from './push/push.service';

@Injectable()
export class NotificationService {
  constructor(
    private emailService: EmailService,
    private pushService: PushService,
  ) {}

  async sendNotification(
    type: NotificationType,
    to: string | number,
    data: any,
    topic?: EmailType,
  ): Promise<void> {
    switch (type) {
      case NotificationType.EMAIL:
        await this.emailService.sendEmail(to as string, topic!, data);
        break;

      case NotificationType.PUSH:
        await this.pushService.send(to as number, data.subject, data.content);
        break;

      default:
        break;
    }
  }
}
