import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get('role');
    const url = role
      ? `${BACKEND_BASE}/api/users/role/${encodeURIComponent(role)}`
      : `${BACKEND_BASE}/api/users`;

    const backendRes = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error fetching users proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
