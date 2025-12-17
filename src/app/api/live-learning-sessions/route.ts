import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real-time Learning Session Types
interface LiveSession {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  scheduledAt: Date;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  sessionType: 'webinar' | 'workshop' | 'one-on-one' | 'group';
  subject: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  learningObjectives: string[];
  materials: SessionMaterial[];
  recording?: {
    url: string;
    duration: number;
    availableAt: Date;
  };
  polls: LivePoll[];
  questions: SessionQuestion[];
  chatMessages: ChatMessage[];
  whiteboardContent?: any;
  screenShareActive: boolean;
  breakoutRooms: BreakoutRoom[];
  participantInteractions: ParticipantInteraction[];
  feedback: SessionFeedback[];
  analytics: SessionAnalytics;
  tags: string[];
  language: string;
  timezone: string;
  registrationRequired: boolean;
  registrationDeadline: Date;
  price?: number;
  currency: string;
  certificates: SessionCertificate[];
  followUpActions: FollowUpAction[];
  integrationStatus: {
    calendar: boolean;
    video: boolean;
    payment: boolean;
    crm: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SessionMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'presentation' | 'spreadsheet' | 'link';
  url: string;
  downloadable: boolean;
  order: number;
  description?: string;
}

interface LivePoll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  results?: PollResults;
  allowsMultiple: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface PollResults {
  totalVotes: number;
  optionResults: { optionId: string; votes: number; percentage: number }[];
}

interface SessionQuestion {
  id: string;
  participantId: string;
  participantName: string;
  question: string;
  timestamp: Date;
  status: 'pending' | 'answered' | 'dismissed';
  answer?: string;
  answeredBy?: string;
  upvotes: number;
  category: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'participant' | 'instructor' | 'moderator';
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'emoji' | 'system';
  fileUrl?: string;
  replyTo?: string;
  reactions: MessageReaction[];
  moderated: boolean;
}

interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  maxParticipants: number;
  isActive: boolean;
  assignedAt: Date;
  duration: number;
  purpose: string;
  results?: any;
}

interface ParticipantInteraction {
  participantId: string;
  joinTime: Date;
  leaveTime?: Date;
  totalTime: number;
  questionsAsked: number;
  pollVotes: number;
  chatMessages: number;
  handRaises: number;
  screenShares: number;
  whiteboardContributions: number;
  engagementScore: number;
  attentionLevel: 'high' | 'medium' | 'low';
  lastActivity: Date;
}

interface SessionFeedback {
  id: string;
  participantId: string;
  participantName: string;
  rating: number; // 1-5
  comment: string;
  aspects: {
    contentQuality: number;
    instructorEffectiveness: number;
    technicalQuality: number;
    engagement: number;
    organization: number;
  };
  anonymous: boolean;
  submittedAt: Date;
  wouldRecommend: boolean;
  followUpInterest: string[];
}

interface SessionAnalytics {
  totalRegistrations: number;
  actualAttendance: number;
  attendanceRate: number;
  averageEngagementTime: number;
  peakConcurrentUsers: number;
  totalQuestions: number;
  totalPollVotes: number;
  totalMessages: number;
  completionRate: number;
  averageRating: number;
  dropOffPoints: { timestamp: number; count: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  geographicDistribution: { country: string; count: number }[];
  engagementHeatmap: { timestamp: number; engagement: number }[];
}

interface SessionCertificate {
  id: string;
  participantId: string;
  certificateType: 'attendance' | 'completion' | 'excellence';
  issuedAt: Date;
  certificateUrl: string;
  verificationCode: string;
  expiresAt?: Date;
}

interface FollowUpAction {
  id: string;
  type: 'email' | 'resource' | 'assessment' | 'next-session' | 'feedback';
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  assignedTo: string[];
  resources?: string[];
}

// GET /api/live-learning-sessions - List sessions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const instructorId = searchParams.get('instructorId');
    const sessionType = searchParams.get('sessionType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const mySessions = searchParams.get('mySessions') === 'true';
    const upcoming = searchParams.get('upcoming') === 'true';
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) where.status = status;
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (difficulty) where.difficultyLevel = difficulty;
    if (instructorId) where.instructorId = instructorId;
    if (sessionType) where.sessionType = sessionType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.status = { in: ['scheduled', 'live'] };
    }

    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // If mySessions is true, get user's sessions (participant or instructor)
    if (mySessions) {
      const userId = request.headers.get('user-id'); // Assuming auth middleware sets this
      where.OR = [
        { instructorId: userId },
        { participants: { some: { userId } } }
      ];
    }

    const [sessions, totalCount] = await Promise.all([
      prisma.liveLearningSession.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
              expertise: true,
            }
          },
          participants: {
            select: {
              userId: true,
              registeredAt: true,
              attended: true,
              engagementScore: true,
            }
          },
          polls: {
            select: {
              id: true,
              question: true,
              isActive: true,
              startTime: true,
            }
          },
          questions: {
            select: {
              id: true,
              participantName: true,
              question: true,
              timestamp: true,
              status: true,
            }
          },
          chatMessages: {
            select: {
              id: true,
              senderName: true,
              message: true,
              timestamp: true,
              type: true,
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              participants: true,
              polls: true,
              questions: true,
              chatMessages: true,
            }
          }
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.liveLearningSession.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Format sessions for response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description,
      instructorId: session.instructorId,
      instructorName: session.instructor.name,
      instructorAvatar: session.instructor.avatar,
      instructorBio: session.instructor.bio,
      instructorExpertise: session.instructor.expertise,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      maxParticipants: session.maxParticipants,
      currentParticipants: session.participants.length,
      status: session.status,
      sessionType: session.sessionType,
      subject: session.subject,
      difficultyLevel: session.difficultyLevel,
      prerequisites: session.prerequisites,
      learningObjectives: session.learningObjectives,
      tags: session.tags,
      language: session.language,
      timezone: session.timezone,
      registrationRequired: session.registrationRequired,
      registrationDeadline: session.registrationDeadline,
      price: session.price,
      currency: session.currency,
      activePolls: session.polls.filter(poll => poll.isActive).length,
      pendingQuestions: session.questions.filter(q => q.status === 'pending').length,
      recentMessages: session.chatMessages,
      isRegistered: session.participants.some(p => 
        p.userId === request.headers.get('user-id')
      ),
      attendanceRate: session.analytics?.attendanceRate || 0,
      averageRating: session.analytics?.averageRating || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        sessions: formattedSessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
        filters: {
          status,
          subject,
          difficulty,
          instructorId,
          sessionType,
          upcoming,
          mySessions,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching live learning sessions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch live learning sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/live-learning-sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      instructorId,
      scheduledAt,
      duration,
      maxParticipants,
      sessionType,
      subject,
      difficultyLevel,
      prerequisites,
      learningObjectives,
      tags,
      language,
      timezone,
      registrationRequired,
      registrationDeadline,
      price,
      currency,
      materials,
      breakoutRooms,
    } = body;

    // Validate required fields
    if (!title || !description || !instructorId || !scheduledAt || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate instructor exists
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) {
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Check for scheduling conflicts
    const conflictingSession = await prisma.liveLearningSession.findFirst({
      where: {
        instructorId,
        status: { in: ['scheduled', 'live'] },
        scheduledAt: {
          gte: new Date(scheduledAt),
          lt: new Date(new Date(scheduledAt).getTime() + duration * 60000),
        },
      },
    });

    if (conflictingSession) {
      return NextResponse.json(
        { success: false, error: 'Instructor has a conflicting session scheduled' },
        { status: 409 }
      );
    }

    // Create session with all required data
    const session = await prisma.liveLearningSession.create({
      data: {
        title,
        description,
        instructorId,
        scheduledAt: new Date(scheduledAt),
        duration,
        maxParticipants: maxParticipants || 50,
        sessionType: sessionType || 'webinar',
        subject,
        difficultyLevel: difficultyLevel || 'beginner',
        prerequisites: prerequisites || [],
        learningObjectives: learningObjectives || [],
        tags: tags || [],
        language: language || 'en',
        timezone: timezone || 'UTC',
        registrationRequired: registrationRequired !== false,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        price: price || 0,
        currency: currency || 'USD',
        status: 'scheduled',
        materials: {
          create: materials?.map((material: any, index: number) => ({
            title: material.title,
            type: material.type,
            url: material.url,
            downloadable: material.downloadable || false,
            order: index,
            description: material.description,
          })) || [],
        },
        breakoutRooms: {
          create: breakoutRooms?.map((room: any) => ({
            name: room.name,
            maxParticipants: room.maxParticipants,
            purpose: room.purpose,
          })) || [],
        },
        analytics: {
          create: {
            totalRegistrations: 0,
            actualAttendance: 0,
            attendanceRate: 0,
            averageEngagementTime: 0,
            peakConcurrentUsers: 0,
            totalQuestions: 0,
            totalPollVotes: 0,
            totalMessages: 0,
            completionRate: 0,
            averageRating: 0,
          },
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        materials: true,
        breakoutRooms: true,
        analytics: true,
      },
    });

    // Send notifications to relevant users (instructor, potentially students)
    // This would integrate with notification service

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          description: session.description,
          instructorId: session.instructorId,
          instructorName: session.instructor.name,
          scheduledAt: session.scheduledAt,
          duration: session.duration,
          maxParticipants: session.maxParticipants,
          status: session.status,
          sessionType: session.sessionType,
          subject: session.subject,
          difficultyLevel: session.difficultyLevel,
          registrationRequired: session.registrationRequired,
          registrationDeadline: session.registrationDeadline,
          price: session.price,
          currency: session.currency,
          materials: session.materials,
          breakoutRooms: session.breakoutRooms,
        },
      },
      message: 'Live learning session created successfully',
    });

  } catch (error) {
    console.error('Error creating live learning session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create live learning session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/live-learning-sessions - Update session
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const userId = request.headers.get('user-id');
    const userRole = request.headers.get('user-role');

    // Check if session exists and user has permission
    const existingSession = await prisma.liveLearningSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check permissions (only instructor or admin can update)
    if (userRole !== 'admin' && existingSession.instructorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this session' },
        { status: 403 }
      );
    }

    // Validate scheduling conflicts if time is being changed
    if (body.scheduledAt && body.duration) {
      const conflictingSession = await prisma.liveLearningSession.findFirst({
        where: {
          id: { not: sessionId },
          instructorId: existingSession.instructorId,
          status: { in: ['scheduled', 'live'] },
          scheduledAt: {
            gte: new Date(body.scheduledAt),
            lt: new Date(new Date(body.scheduledAt).getTime() + body.duration * 60000),
          },
        },
      });

      if (conflictingSession) {
        return NextResponse.json(
          { success: false, error: 'Scheduling conflict detected' },
          { status: 409 }
        );
      }
    }

    // Update session
    const updatedSession = await prisma.liveLearningSession.update({
      where: { id: sessionId },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
        updatedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        participants: true,
        materials: true,
        polls: true,
        questions: true,
        chatMessages: true,
        analytics: true,
      },
    });

    // Send update notifications to registered participants
    // This would integrate with notification service

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: updatedSession.id,
          title: updatedSession.title,
          description: updatedSession.description,
          instructorId: updatedSession.instructorId,
          instructorName: updatedSession.instructor.name,
          scheduledAt: updatedSession.scheduledAt,
          duration: updatedSession.duration,
          status: updatedSession.status,
          sessionType: updatedSession.sessionType,
          subject: updatedSession.subject,
          materials: updatedSession.materials,
          currentParticipants: updatedSession.participants.length,
        },
      },
      message: 'Live learning session updated successfully',
    });

  } catch (error) {
    console.error('Error updating live learning session:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update live learning session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/live-learning-sessions - Cancel/delete session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('user-id');
    const userRole = request.headers.get('user-role');

    // Check if session exists and user has permission
    const existingSession = await prisma.liveLearningSession.findUnique({
      where: { id: sessionId },
      include: {
        instructor: true,
        participants: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check permissions (only instructor or admin can cancel)
    if (userRole !== 'admin' && existingSession.instructorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to cancel this session' },
        { status: 403 }
      );
    }

    // Check if session can be cancelled (not too close to start time)
    const timeUntilSession = existingSession.scheduledAt.getTime() - Date.now();
    const minimumCancellationTime = 24 * 60 * 60 * 1000; // 24 hours

    if (timeUntilSession < minimumCancellationTime && existingSession.status === 'scheduled') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session cannot be cancelled less than 24 hours before start time' 
        },
        { status: 400 }
      );
    }

    // Cancel the session
    const cancelledSession = await prisma.liveLearningSession.update({
      where: { id: sessionId },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          }
        },
      },
    });

    // Process refunds if applicable
    if (cancelledSession.price && cancelledSession.price > 0) {
      // Integrate with payment service for refunds
      // This would handle automatic refunds for paid sessions
    }

    // Send cancellation notifications to all registered participants
    // This would integrate with notification service

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: cancelledSession.id,
          title: cancelledSession.title,
          status: cancelledSession.status,
          cancelledAt: cancelledSession.updatedAt,
          affectedParticipants: cancelledSession.participants.length,
        },
      },
      message: 'Live learning session cancelled successfully',
    });

  } catch (error) {
    console.error('Error cancelling live learning session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel live learning session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Additional utility endpoints would be implemented as separate route handlers:
// POST /api/live-learning-sessions/register - Register for session
// POST /api/live-learning-sessions/[id]/join - Join live session
// POST /api/live-learning-sessions/[id]/polls - Create/manage polls
// POST /api/live-learning-sessions/[id]/questions - Submit questions
// POST /api/live-learning-sessions/[id]/chat - Send chat messages
// POST /api/live-learning-sessions/[id]/feedback - Submit feedback