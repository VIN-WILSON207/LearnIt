import { NextRequest, NextResponse } from 'next/server';
import { canAccessResource } from '@/lib/subscriptionMiddleware';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

// GET: Retrieve all quizzes or specific quiz
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('id');
    const courseId = searchParams.get('courseId');

    const url = new URL('/api/quizzes', BACKEND_BASE);
    if (quizId) url.searchParams.append('id', quizId);
    if (courseId) url.searchParams.append('courseId', courseId);

    const backendRes = await fetch(url.toString(), {
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
};

// POST: Submit quiz attempt
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_BASE}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
};
