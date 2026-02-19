import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(`${BACKEND_BASE}/api/quiz-stats`);
    const search = request.nextUrl.search;
    if (search && search.length > 1) url.search = search;

    const backendRes = await fetch(url.toString(), {
      method: 'GET',
      headers: { Authorization: request.headers.get('authorization') || '' },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching quiz stats proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
