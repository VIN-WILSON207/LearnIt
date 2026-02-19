import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

// GET: Retrieve forum discussions
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const discussionId = searchParams.get('id');

    const url = new URL('/api/forum', BACKEND_BASE);
    if (courseId) url.searchParams.append('courseId', courseId);
    if (discussionId) url.searchParams.append('id', discussionId);

    const backendRes = await fetch(url.toString(), {
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching forum discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
};

// POST: Create new discussion or reply
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const isReply = Boolean(body.parentDiscussionId || body.postId);

    const backendRes = await fetch(
      isReply ? `${BACKEND_BASE}/api/forum/comments` : `${BACKEND_BASE}/api/forum/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('authorization') || '',
        },
        body: JSON.stringify(
          isReply
            ? {
              postId: body.parentDiscussionId || body.postId,
              content: body.content,
            }
            : {
              courseId: body.courseId,
              title: body.title,
              content: body.content,
            }
        ),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
};

// PATCH: Moderate forum content
export const PATCH = async (request: NextRequest) => {
  return NextResponse.json(
    { error: 'Moderation not supported here' },
    { status: 400 }
  );
};
