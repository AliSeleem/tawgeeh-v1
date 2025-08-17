import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
import { GaxiosResponse } from 'gaxios';
import { spec } from 'node:test/reporters';

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
    menteeId: string,
    mentorId: string,
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

    let event: GaxiosResponse<calendar_v3.Schema$Event> | null = null;
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
      data: event?.data.hangoutLink || '',
    };
  }

  // Get available time slots for a service
  async getAvailablehSlots(
    serviceId: number,
    menteeId: string,
  ): Promise<
    ApiResponse<{
      mentor: {
        id: string;
        name: string;
        image_url: string;
        specialization: string;
      };
      service: {
        id: number;
        name: string;
        description: string;
        duration: number;
        questions: { question: string; required: boolean }[];
      };
      slots: { date: Date; sessions: Date[] }[];
    }>
  > {
    const service = await this.prisma.mentorService.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        description: true,
        mentor: {
          select: {
            id: true,
            name: true,
            image_url: true,
            specialization: true,
          },
        },
        duration: true,
        availability: {
          include: {
            days: { include: { intervals: true } },
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            required: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found.`);
    }

    if (!service.availability) {
      throw new BadRequestException('Service has no availability defined.');
    }

    const avail = service.availability;
    const now = new Date();
    const minBookingTime = new Date(
      now.getTime() + (avail.minHoursBefore || 0) * 3600 * 1000,
    );
    let maxBookingTime: Date;
    if (avail.maxDaysBefore) {
      maxBookingTime = new Date(now.getTime() + avail.maxDaysBefore * 86400000);
    } else {
      // Default to 30 days if no max is set
      maxBookingTime = new Date(now.getTime() + 30 * 86400000);
    }

    // Determine available dates within constraints
    let availableDates: Date[] = [];
    if (avail.isRecurring) {
      const currentDate = new Date(minBookingTime);
      currentDate.setHours(0, 0, 0, 0);
      while (currentDate <= maxBookingTime) {
        const dayOfWeek = currentDate
          .toLocaleString('en-us', { weekday: 'long' })
          .toUpperCase();
        if (avail.days.some((day) => day.dayOfWeek === dayOfWeek)) {
          availableDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      availableDates = avail.days
        .map((day) => day.specificDate)
        .filter(
          (d): d is Date => !!d && d >= minBookingTime && d <= maxBookingTime,
        )
        .map((d) => {
          const date = new Date(d);
          date.setHours(0, 0, 0, 0);
          return date;
        });
    }

    // Fetch existing active sessions for mentor in the range
    const startRange = new Date(minBookingTime);
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date(maxBookingTime);
    endRange.setHours(23, 59, 59, 999);

    const existingSessions = await this.prisma.session.findMany({
      where: {
        mentorId: service.mentor.id,
        scheduledAt: { gte: startRange, lte: endRange },
        status: {
          notIn: [
            SessionStatus.CANCELLED,
            SessionStatus.COMPLETED,
            SessionStatus.REJECTED,
          ],
        },
      },
      select: { scheduledAt: true, duration: true },
    });

    // Group existing sessions by day for quick checks
    const dailyBookings: Map<string, number> = new Map();
    const existingByDay: Map<string, { start: Date; end: Date }[]> = new Map();

    for (const sess of existingSessions) {
      const dayStr = sess.scheduledAt.toDateString();
      dailyBookings.set(dayStr, (dailyBookings.get(dayStr) || 0) + 1);

      const sessEnd = new Date(
        sess.scheduledAt.getTime() + sess.duration * 60 * 1000,
      );
      if (!existingByDay.has(dayStr)) {
        existingByDay.set(dayStr, []);
      }
      existingByDay
        .get(dayStr)!
        .push({ start: sess.scheduledAt, end: sessEnd });
    }

    // Fetch mentee's existing sessions if menteeId provided
    let menteeSessions: { start: Date; end: Date }[] = [];
    if (menteeId) {
      const menteeExisting = await this.prisma.session.findMany({
        where: {
          menteeId,
          scheduledAt: { gte: startRange, lte: endRange },
          status: {
            notIn: [
              SessionStatus.CANCELLED,
              SessionStatus.COMPLETED,
              SessionStatus.REJECTED,
            ],
          },
        },
        select: { scheduledAt: true, duration: true },
      });
      menteeSessions = menteeExisting.map((s) => ({
        start: s.scheduledAt,
        end: new Date(s.scheduledAt.getTime() + s.duration * 60 * 1000),
      }));
    }

    // Generate available slots
    const slots: Date[] = [];
    const serviceDurationMs = service.duration * 60 * 1000; // Service duration in milliseconds
    const breakDurationMs = 15 * 60 * 1000; // 15-minute break duration
    const stepMs = 15 * 60 * 1000; // Check slots every 15 minutes

    for (const date of availableDates) {
      const dayStr = date.toDateString();
      const maxPerDay = avail.maxBookingsPerDay || Infinity;
      const currentBookings = dailyBookings.get(dayStr) || 0;

      // Skip if max bookings per day reached
      if (currentBookings >= maxPerDay) continue;

      const matchingDay = avail.days.find((day) =>
        avail.isRecurring
          ? day.dayOfWeek ===
            date.toLocaleString('en-us', { weekday: 'long' }).toUpperCase()
          : day.specificDate?.toDateString() === dayStr,
      );
      if (!matchingDay) continue;

      const dayExisting = existingByDay.get(dayStr) || [];

      for (const interval of matchingDay.intervals) {
        const [startH, startM] = interval.startTime.split(':').map(Number);
        const intervalStart = new Date(date);
        intervalStart.setHours(startH, startM, 0, 0);

        const [endH, endM] = interval.endTime.split(':').map(Number);
        const intervalEnd = new Date(date);
        intervalEnd.setHours(endH, endM, 0, 0);

        let currentStart = new Date(intervalStart);

        // Generate slots within this interval
        while (
          currentStart.getTime() + serviceDurationMs <=
          intervalEnd.getTime()
        ) {
          // Skip if before minimum booking time
          if (currentStart < minBookingTime) {
            currentStart = new Date(currentStart.getTime() + stepMs);
            continue;
          }

          const currentEnd = new Date(
            currentStart.getTime() + serviceDurationMs,
          );

          // Check overlap with mentor's existing sessions
          const hasOverlap = dayExisting.some(
            (sess) => sess.start < currentEnd && sess.end > currentStart,
          );
          if (hasOverlap) {
            currentStart = new Date(currentStart.getTime() + stepMs);
            continue;
          }

          // Check break requirements if enabled
          if (avail.break) {
            const hasBreakViolation = dayExisting.some((sess) => {
              // Calculate gaps between this potential slot and existing sessions
              const gapFromSessionEnd =
                currentStart.getTime() - sess.end.getTime();
              const gapToSessionStart =
                sess.start.getTime() - currentEnd.getTime();

              // Check if there's insufficient break time
              return (
                (gapFromSessionEnd > 0 &&
                  gapFromSessionEnd < breakDurationMs) ||
                (gapToSessionStart > 0 && gapToSessionStart < breakDurationMs)
              );
            });

            if (hasBreakViolation) {
              currentStart = new Date(currentStart.getTime() + stepMs);
              continue;
            }
          }

          // Check overlap with mentee's existing sessions
          if (menteeSessions.length > 0) {
            const hasMenteeOverlap = menteeSessions.some(
              (s) => s.start < currentEnd && s.end > currentStart,
            );
            if (hasMenteeOverlap) {
              currentStart = new Date(currentStart.getTime() + stepMs);
              continue;
            }
          }

          // Slot is available
          slots.push(new Date(currentStart));

          // Move to next potential slot (service duration + break)
          currentStart = new Date(
            currentEnd.getTime() + (avail.break ? breakDurationMs : 0),
          );
        }
      }
    }

    // Sort slots chronologically
    slots.sort((a, b) => a.getTime() - b.getTime());

    // Group slots by day
    const groupedSlots: { date: Date; sessions: Date[] }[] = [];
    const slotsByDay: Map<string, Date[]> = new Map();

    for (const slot of slots) {
      const dayStr = slot.toDateString();
      if (!slotsByDay.has(dayStr)) {
        slotsByDay.set(dayStr, []);
      }
      slotsByDay.get(dayStr)!.push(slot);
    }

    // Convert map to array format
    for (const [dayStr, daySessions] of slotsByDay.entries()) {
      const dayDate = new Date(dayStr);
      groupedSlots.push({
        date: dayDate,
        sessions: daySessions.sort((a, b) => a.getTime() - b.getTime()),
      });
    }

    // Sort grouped slots by date
    groupedSlots.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      success: true,
      message: 'Available slots retrieved successfully.',
      data: {
        mentor: {
          id: service.mentor.id,
          name: service.mentor.name,
          image_url: service.mentor.image_url || '',
          specialization: service.mentor.specialization,
        },
        service: {
          id: serviceId,
          name: service.name,
          description: service.description,
          duration: service.duration,
          questions: service.questions,
        },
        slots: groupedSlots,
      },
    };
  }

  // Mentee requests a session
  async requestSession(
    dto: CreateSessionDto,
    menteeId: string,
  ): Promise<ApiResponse<any>> {
    const sessionStart = new Date(dto.scheduledAt);
    const sessionEnd = new Date(
      sessionStart.getTime() + dto.duration * 60 * 1000,
    );

    // Helper to check overlapping active sessions
    const hasOverlappingSession = async (
      userId: string,
      role: 'mentee' | 'mentor',
    ) => {
      const relation = role === 'mentee' ? 'menteeSessions' : 'mentorSessions';
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          [relation]: {
            where: {
              status: {
                notIn: [
                  SessionStatus.CANCELLED,
                  SessionStatus.COMPLETED,
                  SessionStatus.REJECTED,
                ],
              },
              scheduledAt: {
                gte: sessionStart,
                lt: sessionEnd,
              },
            },
          },
        },
      });
      if (!user)
        throw new NotFoundException(`User with ID ${userId} not found.`);
      return user[relation].length > 0;
    };

    // 1 – Validate Mentee
    if (await hasOverlappingSession(menteeId, 'mentee')) {
      throw new BadRequestException(
        'Mentee already has an overlapping session.',
      );
    }

    // 2 – Validate Mentor
    if (await hasOverlappingSession(dto.mentorId, 'mentor')) {
      throw new BadRequestException(
        'Mentor already has an overlapping session.',
      );
    }

    // 4 – Validate Service
    const service = await this.prisma.mentorService.findUnique({
      where: { id: dto.serviceId },
      include: {
        availability: {
          include: {
            days: { include: { intervals: true } },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(
        `Service with ID ${dto.serviceId} not found.`,
      );
    }

    const scheduledDate = new Date(dto.scheduledAt);
    const dayOfWeek = scheduledDate
      .toLocaleString('en-us', { weekday: 'long' })
      .toUpperCase();

    // 5 – Match Availability Date
    const matchingDay = service.availability?.days.find((day) =>
      service.availability?.isRecurring
        ? day.dayOfWeek === dayOfWeek
        : day.specificDate?.toDateString() === scheduledDate.toDateString(),
    );
    if (!matchingDay) {
      throw new BadRequestException(
        'Service is not available for the selected date.',
      );
    }

    // 6 – Validate Booking Time Constraints
    const now = new Date();
    const minBookingTime = new Date(
      now.getTime() + (service.availability?.minHoursBefore || 0) * 3600 * 1000,
    );
    const maxBookingTime = service.availability?.maxDaysBefore
      ? new Date(now.getTime() + service.availability?.maxDaysBefore * 86400000)
      : null;
    if (
      scheduledDate < minBookingTime ||
      (maxBookingTime && scheduledDate > maxBookingTime)
    ) {
      throw new BadRequestException(
        'Selected date is outside booking constraints.',
      );
    }

    // 7 – Check Daily Booking Limit
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSessions = await this.prisma.session.count({
      where: {
        mentorId: dto.mentorId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: {
          notIn: [
            SessionStatus.CANCELLED,
            SessionStatus.COMPLETED,
            SessionStatus.REJECTED,
          ],
        },
      },
    });
    if (existingSessions >= (service.availability?.maxBookingsPerDay || 0)) {
      throw new BadRequestException('Maximum bookings reached for this day.');
    }

    // 8 – Validate Time Interval
    const isWithinInterval = matchingDay.intervals.some((interval) => {
      const [startH, startM] = interval.startTime.split(':').map(Number);
      const [endH, endM] = interval.endTime.split(':').map(Number);

      const intervalStart = new Date(scheduledDate);
      intervalStart.setHours(startH, startM, 0, 0);
      const intervalEnd = new Date(scheduledDate);
      intervalEnd.setHours(endH, endM, 0, 0);

      return (
        sessionStart >= intervalStart &&
        sessionEnd <= intervalEnd &&
        dto.duration <= service.duration
      );
    });

    if (!isWithinInterval) {
      throw new BadRequestException(
        'Session time is outside available intervals.',
      );
    }

    // 9 – Check Overlapping Sessions with Breaks
    if (service.availability?.break) {
      const overlappingSessions = await this.prisma.session.findMany({
        where: {
          mentorId: dto.mentorId,
          status: { not: SessionStatus.CANCELLED },
          scheduledAt: {
            gte: new Date(sessionStart.getTime() - 15 * 60000),
            lte: new Date(sessionEnd.getTime() + 15 * 60000),
          },
        },
      });
      if (overlappingSessions.length > 0) {
        throw new BadRequestException(
          'Requested time conflicts with existing sessions.',
        );
      }
    }

    // 10 – Create Session
    const session = await this.prisma.session.create({
      data: {
        menteeId,
        mentorId: dto.mentorId,
        serviceId: dto.serviceId,
        scheduledAt: dto.scheduledAt,
        duration: dto.duration,
        status: SessionStatus.PENDING,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
            image_url: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
            image_url: true,
          },
        },
        service: true,
      },
    });

    // 10 – Add Answers
    if (dto.answers?.length) {
      await this.prisma.answer.createMany({
        data: dto.answers.map((a) => ({ ...a, sessionId: session.id })),
      });
    }

    // 11 – Notify Mentor
    await this.notificationsService.sendNotification(
      NotificationType.EMAIL,
      session.mentor.email,
      { menteeName: session.mentee.name, scheduledAt: dto.scheduledAt },
      EmailType.SESSION_REQUEST,
    );
    await this.notificationsService.sendNotification(
      NotificationType.PUSH,
      session.mentor.id,
      {
        subject: 'New Session Request',
        content: 'You have a new session request.',
      },
      EmailType.SESSION_REQUEST,
    );

    return {
      success: true,
      message: 'Session requested successfully.',
      data: session,
    };
  }

  // Mentor accepts a session
  async acceptSession(
    sessionId: string,
    mentorId: string,
  ): Promise<ApiResponse<any>> {
    // Check if session exists
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: true,
      },
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
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
    mentorId: string,
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
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
    userId: string,
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
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
    userId: string,
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
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
    mentorId: string,
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
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
    menteeId: string,
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
      include: {
        mentee: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        service: true,
      },
    });

    return {
      success: true,
      message: 'Session feedback added successfully.',
      data: updatedSession,
    };
  }

  // Get all sessions for a user (mentee or mentor)
  async getUserSessions(
    userId: string,
    filter?: SessionStatus,
  ): Promise<ApiResponse<any>> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Validate filter
    if (filter && !Object.values(SessionStatus).includes(filter)) {
      throw new BadRequestException('Invalid filter value.');
    }

    // Get all sessions for the user
    const sessions = await this.prisma.session.findMany({
      where: {
        OR: [{ menteeId: userId }, { mentorId: userId }],
        ...(filter && { status: filter }),
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            image_url: true,
            specialization: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            image_url: true,
            specialization: true,
          },
        },
        answers: true,
        service: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // split sessions into mentee and mentor
    const menteeSessions = sessions.filter((s) => s.menteeId === userId);
    const mentorSessions = sessions.filter((s) => s.mentorId === userId);

    return {
      success: true,
      message: "User's sessions retrieved successfully.",
      data: { menteeSessions, mentorSessions },
    };
  }

  // Get a specific session
  async getSession(
    sessionId: string,
    userId: string,
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
