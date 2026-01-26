import { NextRequest, NextResponse } from 'next/server';
import { mockForumDiscussions } from '@/lib/mockData';

// GET: Retrieve forum discussions
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const discussionId = searchParams.get('id');

  if (discussionId) {
    const discussion = mockForumDiscussions.find(d => d.id === discussionId);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(discussion, { status: 200 });
  }

  if (courseId) {
    const courseDiscussions = mockForumDiscussions.filter(d => d.courseId === courseId);
    return NextResponse.json(courseDiscussions, { status: 200 });
  }

  return NextResponse.json(mockForumDiscussions, { status: 200 });
};

// POST: Create new discussion or reply
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { courseId, userId, title, content, parentDiscussionId, userRole } = body;

    if (!courseId || !userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (parentDiscussionId) {
      // Add reply to existing discussion
      const discussion = mockForumDiscussions.find(d => d.id === parentDiscussionId);
      if (!discussion) {
        return NextResponse.json(
          { error: 'Discussion not found' },
          { status: 404 }
        );
      }

      const reply = {
        id: `reply-${Date.now()}`,
        author: 'User', // In real app, get from user object
        authorRole: userRole || 'student',
        content,
        createdDate: new Date().toISOString().split('T')[0],
        isApproved: userRole === 'instructor', // Auto-approve instructor replies
      };

      discussion.replies.push(reply);

      return NextResponse.json(
        {
          success: true,
          message: 'Reply added successfully',
          reply,
        },
        { status: 201 }
      );
    } else {
      // Create new discussion
      const newDiscussion = {
        id: `forum-${Date.now()}`,
        courseId,
        title,
        author: 'User',
        authorRole: userRole || 'student',
        content,
        createdDate: new Date().toISOString().split('T')[0],
        replies: [],
        isModerated: false,
        minPlanAccess: 'free',
      };

      // In real app, save to DB
      return NextResponse.json(
        {
          success: true,
          message: 'Discussion created successfully',
          discussion: newDiscussion,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
};

// PATCH: Moderate forum content
export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { discussionId, replyId, action, moderation } = body; // action: 'approve', 'reject', 'delete'

    if (!discussionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const discussion = mockForumDiscussions.find(d => d.id === discussionId);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    if (replyId) {
      // Moderate reply
      const reply = discussion.replies.find(r => r.id === replyId);
      if (!reply) {
        return NextResponse.json(
          { error: 'Reply not found' },
          { status: 404 }
        );
      }

      if (action === 'approve') {
        reply.isApproved = true;
      } else if (action === 'delete') {
        discussion.replies = discussion.replies.filter(r => r.id !== replyId);
      }
    } else {
      // Moderate discussion
      if (action === 'delete') {
        // Remove discussion (in real app, mark as deleted)
        const index = mockForumDiscussions.findIndex(d => d.id === discussionId);
        if (index > -1) {
          mockForumDiscussions.splice(index, 1);
        }
      } else {
        discussion.isModerated = true;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Discussion ${action}ed successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to moderate discussion' },
      { status: 500 }
    );
  }
};
