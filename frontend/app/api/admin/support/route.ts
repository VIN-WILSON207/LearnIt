import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

// Get all support messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const backendRes = await fetch(`${BACKEND_BASE}/api/support`, {
      method: 'GET',
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching support messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
