import { NextRequest, NextResponse } from 'next/server';
import { mockQuizzes } from '@/lib/mockData';
import { canAccessResource } from '@/lib/subscriptionMiddleware';

// GET: Retrieve all quizzes or specific quiz
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('id');
  const courseId = searchParams.get('courseId');
  const userId = searchParams.get('userId'); // To check subscription

  if (quizId) {
    const quiz = mockQuizzes.find(q => q.id === quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(quiz, { status: 200 });
  }

  if (courseId) {
    const courseQuizzes = mockQuizzes.filter(q => q.courseId === courseId);
    return NextResponse.json(courseQuizzes, { status: 200 });
  }

  return NextResponse.json(mockQuizzes, { status: 200 });
};

// POST: Submit quiz attempt
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { quizId, userId, answers, userSubscriptionPlan } = body;

    if (!quizId || !userId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find quiz
    const quiz = mockQuizzes.find(q => q.id === quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check subscription access
    if (!canAccessResource({ id: userId, subscription: { plan: userSubscriptionPlan, startDate: '', endDate: '', status: 'active' } } as any, quiz.minPlan as any)) {
      return NextResponse.json(
        { 
          error: 'Insufficient subscription level',
          required: quiz.minPlan,
          message: `This quiz requires ${quiz.minPlan} plan or higher`
        },
        { status: 403 }
      );
    }

    // Calculate score (simplified)
    let correctAnswers = 0;
    let totalQuestions = quiz.totalQuestions;

    answers.forEach((answer: any) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question && question.type === 'multiple-choice') {
        if (question.correctAnswer === answer.selectedAnswer) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Store attempt (in real app, save to DB)
    const attempt = {
      attemptId: `ATT-${Date.now()}`,
      quizId,
      userId,
      score,
      passed,
      totalQuestions,
      correctAnswers,
      attemptedAt: new Date().toISOString(),
      completionTime: 25, // minutes (example)
    };

    return NextResponse.json(
      {
        success: true,
        attempt,
        feedback: {
          score,
          passed,
          message: passed ? 'Congratulations! You passed!' : 'Try again to improve your score',
          passingScore: quiz.passingScore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
};
