import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationStorageService {
  constructor(private readonly prisma: PrismaService) {}

  async storeNotification(
    userId: number,
    title: string,
    body: string,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        sent: false,
      },
    });
  }

  async getUndeliveredNotifications(userId: number): Promise<any[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        sent: false,
      },
    });
  }

  async markAsDelivered(notificationId: number): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { sent: true },
    });
  }
}
