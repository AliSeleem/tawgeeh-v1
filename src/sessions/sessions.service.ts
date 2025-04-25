import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { calendar_v3, google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { NotificationService } from 'src/notification/notification.service';
import { EmailType } from '../notification/enums/notification-type.enum';

@Injectable()
export class SessionsService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private notificationsService: NotificationService,
  ) {}

  private createGoogleAuthClient() {
    return new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
  }

  async createGoogleMeetLink(
    scheduledAt: Date,
    requesterId: number,
    requestedId: number,
  ): Promise<ApiResponse<string>> {
    const oauth2Client = this.createGoogleAuthClient();

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    // Fetch user emails
    const requesterUser = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { email: true, name: true },
    });

    const requestedUser = await this.prisma.user.findUnique({
      where: { id: requestedId },
      select: { email: true, name: true },
    });

    if (!requesterUser || !requestedUser) {
      throw new NotFoundException('Users not found');
    }

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const attendees = [
      {
        email: requesterUser.email,
        displayName: requesterUser.name || 'Requester',
      },
      {
        email: requestedUser.email,
        displayName: requestedUser.name || 'Requested',
      },
    ];

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Scheduled Session',
        description: `Meeting between ${requesterUser.name} and ${requestedUser.name}`,
        start: { dateTime: scheduledAt.toISOString(), timeZone: 'UTC' },
        end: {
          dateTime: new Date(
            new Date(scheduledAt).getTime() + 60 * 60 * 1000,
          ).toISOString(),
          timeZone: 'UTC',
        },
        attendees: attendees,
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        visibility: 'public',
        guestsCanModify: true,
      },
      conferenceDataVersion: 1,
    });

    return {
      success: true,
      message: 'Google Meet link created successfully.',
      data: event.data.hangoutLink || '',
    };
  }

  async requestSession(
    requesterId: number,
    requestedId: number,
    scheduledAt: Date,
  ): Promise<ApiResponse<any>> {
    const session = await this.prisma.session.create({
      data: { requesterId, requestedId, scheduledAt },
    });

    const requestedUser = await this.prisma.user.findUnique({
      where: { id: requestedId },
      select: { email: true, name: true },
    });
    const requesterUser = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { email: true, name: true },
    });

    if (requestedUser) {
      await this.notificationsService.sendNotification(
        EmailType.SESSION_REQUEST,
        requestedUser.email,
        { requesterName: requesterUser?.name, scheduledAt },
      );
    }

    return {
      success: true,
      message: 'Session requested successfully.',
      data: session,
    };
  }

  async acceptSession(
    sessionId: string,
    requestedUserId: number,
  ): Promise<ApiResponse<any>> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { requester: true, requested: true },
    });

    if (!session || session.requestedId !== requestedUserId) {
      throw new NotFoundException('Session not found');
    }

    const googleMeetResponse = await this.createGoogleMeetLink(
      session.scheduledAt,
      session.requesterId,
      session.requestedId,
    );

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACCEPTED', googleMeetUrl: googleMeetResponse.data },
    });

    if (session.requester && session.requested) {
      await this.notificationsService.sendNotification(
        EmailType.SESSION_ACCEPTED,
        session.requested.email,
        {
          requesterName: session.requester?.name,
          scheduledAt: session.scheduledAt,
          meetLink: googleMeetResponse.data,
        },
      );

      await this.notificationsService.sendNotification(
        EmailType.SESSION_ACCEPTED,
        session.requester.email,
        {
          requesterName: session.requested?.name,
          scheduledAt: session.scheduledAt,
          meetLink: googleMeetResponse.data,
        },
      );
    }

    return {
      success: true,
      message: 'Session accepted successfully.',
      data: updatedSession,
    };
  }

  async rejectSession(
    sessionId: string,
    requestedUserId: number,
  ): Promise<ApiResponse<any>> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.requestedId !== requestedUserId) {
      throw new NotFoundException('Session not found');
    }

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'REJECTED' },
    });

    return {
      success: true,
      message: 'Session rejected successfully.',
      data: updatedSession,
    };
  }

  async userSessions(id: number) {
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          OR: [{ requesterId: id }, { requestedId: id }],
        },
        orderBy: {
          scheduledAt: 'desc',
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          requested: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!sessions.length) {
        throw new NotFoundException('No sessions found for this user');
      }

      console.log(sessions);
      return {
        success: true,
        message: "user's sessions retrived successfully",
        data: sessions,
      };
    } catch (error) {
      console.error(`❌ Error fetching sessions for user ${id}:`, error);
      throw new InternalServerErrorException('Could not retrieve sessions');
    }
  }
}
