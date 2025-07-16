import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { SessionsModule } from './sessions/sessions.module';
import { NotificationModule } from './notification/notification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProfileModule } from './profile/profile.module';
import { ExploreModule } from './explore/explore.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    UsersModule,
    PrismaModule,
    ChatModule,
    SessionsModule,
    NotificationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ExploreModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
