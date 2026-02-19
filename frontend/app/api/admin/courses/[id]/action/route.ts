import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_BASE}/api/admin/courses/${id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await backendRes.json() : await backendRes.text();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error proxying admin course action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
