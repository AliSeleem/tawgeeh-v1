import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { PushService } from './push/push.service';
import { NotificationController } from './push/notification.controller';
import { NotificationStorageService } from './push/notification-storage.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [NotificationController],
  providers: [
    EmailService,
    NotificationService,
    PushService,
    NotificationStorageService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
