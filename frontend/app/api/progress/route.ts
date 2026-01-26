import { NextRequest, NextResponse } from 'next/server';

// Mock progress data
const mockProgress: Record<string, any> = {};

// GET: Retrieve user progress
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const courseId = searchParams.get('courseId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const key = courseId ? `${userId}-${courseId}` : userId;
  const progress = mockProgress[key] || {
    userId,
    courseId: courseId || 'all',
    coursesEnrolled: 3,
    coursesCompleted: 1,
    averageProgress: 65,
    totalTimeSpent: 1250, // minutes
    certificatesEarned: 1,
    currentStreak: 5, // days
    coursesInProgress: [
      {
        courseId: '1',
        title: 'Introduction to ICT',
        progress: 75,
        lastAccessed: '2024-01-20',
        timeSpent: 450,
        modulesCompleted: 3,
        totalModules: 4,
      },
      {
        courseId: '2',
        title: 'Computer Science Fundamentals',
        progress: 45,
        lastAccessed: '2024-01-19',
        timeSpent: 300,
        modulesCompleted: 2,
        totalModules: 5,
      },
    ],
  };

  return NextResponse.json(progress, { status: 200 });
};

// POST: Update user progress
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, courseId, moduleId, action, timeSpent } = body;

    if (!userId || !courseId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const key = `${userId}-${courseId}`;
    
    if (!mockProgress[key]) {
      mockProgress[key] = {
        userId,
        courseId,
        modulesCompleted: 0,
        modulesViewed: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    const progress = mockProgress[key];

    if (action === 'complete-module') {
      if (!progress.modulesViewed.includes(moduleId)) {
        progress.modulesViewed.push(moduleId);
      }
      progress.lastUpdated = new Date().toISOString();
      progress.modulesCompleted = progress.modulesViewed.length;
    } else if (action === 'add-time') {
      progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpent;
    } else if (action === 'complete-course') {
      progress.completed = true;
      progress.completionDate = new Date().toISOString();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Progress updated successfully',
        progress,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
};
