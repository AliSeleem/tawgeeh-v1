import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from 'src/notification/notification.service';
import { google, calendar_v3 } from 'googleapis';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionNotesDto } from './dto/update-session-notes.dto';
import { UpdateSessionFeedbackDto } from './dto/update-session-feedback.dto';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { SessionStatus, User } from '@prisma/client';
import {
  EmailType,
  NotificationType,
} from '../notification/enums/notification-type.enum';
import { subscribe } from 'diagnostics_channel';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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
    menteeId: number,
    mentorId: number,
  ): Promise<ApiResponse<string>> {
    const oauth2Client = this.createGoogleAuthClient();

    // Fetch user emails
    const menteeUser = await this.prisma.user.findUnique({
      where: { id: menteeId },
      select: { email: true, name: true },
    });

    const mentorUser = await this.prisma.user.findUnique({
      where: { id: mentorId },
      select: { email: true, name: true },
    });

    if (!menteeUser || !mentorUser) {
      throw new NotFoundException('Users not found');
    }

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const attendees = [
      {
        email: menteeUser.email,
        displayName: menteeUser.name || 'Mentee',
      },
      {
        email: mentorUser.email,
        displayName: mentorUser.name || 'Mentor',
      },
    ];

    let event;
    try {
      event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: 'Mentorship Session',
          description: `Meeting between ${menteeUser.name} and ${mentorUser.name}`,
          start: { dateTime: scheduledAt.toISOString(), timeZone: 'UTC' },
          end: {
            dateTime: new Date(
              scheduledAt.getTime() + 60 * 60 * 1000,
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
    } catch (error) {
      console.log(error);
    }

    return {
      success: true,
      message: 'Google Meet link created successfully.',
      data: event.data.hangoutLink || '',
    };
  }

  // Mentee requests a session
  async requestSession(
    dto: CreateSessionDto,
    menteeId: number,
  ): Promise<ApiResponse<any>> {
    // Check if mentee exists
    const mentee = await this.prisma.user.findUnique({
      where: { id: menteeId },
    });
    if (!mentee) {
      throw new NotFoundException(`User with ID ${menteeId} not found.`);
    }
    // Check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${dto.mentorId} not found.`);
    }
    // Check if service exists
    const service = await this.prisma.mentorService.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(
        `Service with ID ${dto.serviceId} not found.`,
      );
    }
    // Create the session
    const session = await this.prisma.session.create({
      data: {
        menteeId,
        mentorId: dto.mentorId,
        serviceId: dto.serviceId,
        scheduledAt: dto.scheduledAt,
        duration: dto.duration,
        menteeQ: dto.menteeQ,
        status: SessionStatus.PENDING,
      },
      include: { mentee: true, mentor: true, service: true },
    });

    // add answers
    if (dto.answers && dto.answers.length > 0) {
      await this.prisma.answer.createMany({
        data: dto.answers.map((answer) => ({
          ...answer,
          sessionId: session.id,
        })),
      });
    }

    // Send notification to mentor
    if (mentor) {
      await this.notificationsService.sendNotification(
        NotificationType.EMAIL,
        mentor.email,
        { menteeName: mentee.name, scheduledAt: dto.scheduledAt },
        EmailType.SESSION_REQUEST,
      );
      await this.notificationsService.sendNotification(
        NotificationType.PUSH,
        mentor.id,
        {
          subject: 'New Session Request',
          content: 'You have a new session request review the email.',
        },
        EmailType.SESSION_REQUEST,
      );
    }

    return {
      success: true,
      message: 'Session requested successfully.',
      data: session,
    };
  }

  // Mentor accepts a session
  async acceptSession(
    sessionId: string,
    mentorId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { mentee: true, mentor: true },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    // Check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found.`);
    }
    // Authorization check
    if (session.mentorId !== mentorId) {
      throw new ForbiddenException(
        'Only the assigned mentor can accept this session.',
      );
    }
    if (session.status !== SessionStatus.PENDING) {
      throw new ForbiddenException('Session is not in PENDING status.');
    }
    console.log('first');
    // Create Google Meet link
    const googleMeetResponse = await this.createGoogleMeetLink(
      session.scheduledAt,
      session.menteeId,
      session.mentorId,
    );
    // Update session status
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ACCEPTED,
        googleMeetUrl: googleMeetResponse.data,
      },
      include: { mentee: true, mentor: true, service: true },
    });

    // Send notifications to mentee and mentor
    if (session.mentee && session.mentor) {
      await this.notificationsService.sendNotification(
        NotificationType.EMAIL,
        session.mentor.email,
        {
          menteeName: session.mentee.name,
          scheduledAt: session.scheduledAt,
          meetLink: googleMeetResponse.data,
        },
        EmailType.SESSION_ACCEPTED,
      );

      await this.notificationsService.sendNotification(
        NotificationType.EMAIL,
        session.mentee.email,
        {
          mentorName: session.mentor.name,
          scheduledAt: session.scheduledAt,
          meetLink: googleMeetResponse.data,
        },
        EmailType.SESSION_ACCEPTED,
      );
    }

    return {
      success: true,
      message: 'Session accepted successfully.',
      data: updatedSession,
    };
  }

  // Mentor rejects a session
  async rejectSession(
    sessionId: string,
    mentorId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    // Check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found.`);
    }
    // Authorization check
    if (session.mentorId !== mentorId) {
      throw new ForbiddenException(
        'Only the assigned mentor can reject this session.',
      );
    }
    if (session.status !== SessionStatus.PENDING) {
      throw new ForbiddenException('Session is not in PENDING status.');
    }
    // Update session status
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.REJECTED },
      include: { mentee: true, mentor: true, service: true },
    });

    return {
      success: true,
      message: 'Session rejected successfully.',
      data: updatedSession,
    };
  }

  // Mentee or mentor cancels a session
  async cancelSession(
    sessionId: string,
    userId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Authorization check
    if (session.menteeId !== userId && session.mentorId !== userId) {
      throw new ForbiddenException(
        'Only the mentee or mentor can cancel this session.',
      );
    }
    if (
      session.status !== SessionStatus.PENDING &&
      session.status !== SessionStatus.ACCEPTED
    ) {
      throw new ForbiddenException(
        'Only PENDING or ACCEPTED sessions can be cancelled.',
      );
    }
    // Update session status
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: SessionStatus.CANCELLED },
      include: { mentee: true, mentor: true, service: true },
    });

    return {
      success: true,
      message: 'Session cancelled successfully.',
      data: updatedSession,
    };
  }

  // Mentee or mentor marks a session as complete
  async completeSession(
    sessionId: string,
    userId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Authorization check
    if (session.menteeId !== userId && session.mentorId !== userId) {
      throw new ForbiddenException(
        'Only the mentee or mentor can mark this session as complete.',
      );
    }
    if (session.status !== SessionStatus.ACCEPTED) {
      throw new ForbiddenException(
        'Only ACCEPTED sessions can be marked as complete.',
      );
    }
    // Update session status
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        mentee: {
          update: {
            totalMinutes: { increment: session.duration },
            totalSessions: { increment: 1 },
          },
        },
        mentor: {
          update: {
            totalMinutes: { increment: session.duration },
            totalSessions: { increment: 1 },
          },
        },
      },
      include: { mentee: true, mentor: true, service: true },
    });

    return {
      success: true,
      message: 'Session marked as complete successfully.',
      data: updatedSession,
    };
  }

  // Mentor adds notes upon completion
  async addNotes(
    dto: UpdateSessionNotesDto,
    mentorId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Session with ID ${dto.sessionId} not found.`,
      );
    }
    // Check if mentor exists
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found.`);
    }
    // Authorization check
    if (session.mentorId !== mentorId) {
      throw new ForbiddenException('Only the assigned mentor can add notes.');
    }
    if (session.status !== SessionStatus.COMPLETED) {
      throw new ForbiddenException(
        'Notes can only be added to COMPLETED sessions.',
      );
    }
    // Update session notes
    const updatedSession = await this.prisma.session.update({
      where: { id: dto.sessionId },
      data: { notes: dto.notes },
      include: { mentee: true, mentor: true, service: true },
    });

    return {
      success: true,
      message: 'Session notes added successfully.',
      data: updatedSession,
    };
  }

  // Mentee adds feedback upon completion
  async addFeedback(
    dto: UpdateSessionFeedbackDto,
    menteeId: number,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Session with ID ${dto.sessionId} not found.`,
      );
    }
    // Check if mentee exists
    const mentee = await this.prisma.user.findUnique({
      where: { id: menteeId },
    });
    if (!mentee) {
      throw new NotFoundException(`Mentee with ID ${menteeId} not found.`);
    }
    // Authorization check
    if (session.menteeId !== menteeId) {
      throw new ForbiddenException(
        'Only the assigned mentee can add feedback.',
      );
    }
    if (session.status !== SessionStatus.COMPLETED) {
      throw new ForbiddenException(
        'Feedback can only be added to COMPLETED sessions.',
      );
    }
    // Update session feedback
    const updatedSession = await this.prisma.session.update({
      where: { id: dto.sessionId },
      data: { feedback: dto.feedback },
      include: { mentee: true, mentor: true, service: true },
    });

    return {
      success: true,
      message: 'Session feedback added successfully.',
      data: updatedSession,
    };
  }

  // Get all sessions for a user (mentee or mentor)
  async getUserSessions(userId: number): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    try {
      // Get all sessions for the user
      const sessions = await this.prisma.session.findMany({
        where: {
          OR: [{ menteeId: userId }, { mentorId: userId }],
        },
        include: {
          mentee: { select: { id: true, name: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
          answers: true,
          service: {
            include: {
              questions: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      });

      if (!sessions.length) {
        throw new NotFoundException('No sessions found for this user');
      }

      return {
        success: true,
        message: "User's sessions retrieved successfully.",
        data: sessions,
      };
    } catch (error) {
      console.error(`❌ Error fetching sessions for user ${userId}:`, error);
      throw new InternalServerErrorException('Could not retrieve sessions');
    }
  }

  // Get a specific session
  async getSession(
    sessionId: string,
    userId: number,
  ): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        answers: true,
        service: {
          include: {
            questions: true,
          },
        },
      },
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    // Authorization check
    if (session.menteeId !== userId && session.mentorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this session.',
      );
    }

    return {
      success: true,
      message: 'Session retrieved successfully.',
      data: session,
    };
  }
}
