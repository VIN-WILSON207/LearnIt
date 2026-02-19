import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const backendRes = await fetch(`${BACKEND_BASE}/api/analytics/course/${courseId}`, {
      method: 'GET',
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching course analytics proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
