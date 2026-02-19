import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const discussionId = searchParams.get('id');
    const token = request.headers.get('Authorization') || '';

    let url = `${BACKEND_BASE}/api/forum`;
    if (discussionId) {
      url += `?id=${discussionId}`;
    } else if (courseId) {
      url += `?courseId=${courseId}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: token },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch forum posts' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Forum proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization') || '';
    const body = await request.json();

    const response = await fetch(`${BACKEND_BASE}/api/forum/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to create forum post' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Forum proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    );
  }
}
