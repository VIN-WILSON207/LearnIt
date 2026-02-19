import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';
// GET: Retrieve user certificates
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all');

  const url = all === 'true'
    ? new URL('/api/certificates/all', BACKEND_BASE)
    : new URL('/api/certificates', BACKEND_BASE);

  const backendRes = await fetch(url.toString(), {
    headers: {
      Authorization: request.headers.get('authorization') || '',
    },
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, id } = body;

    const token = request.headers.get('authorization') || '';

    // Download Certificate
    if (action === 'download' && id) {
      const backendRes = await fetch(`${BACKEND_BASE}/api/certificates/${id}/download`, {
        headers: { Authorization: token },
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      } else {
        const error = await backendRes.json();
        return NextResponse.json(error, { status: backendRes.status });
      }
    }

    // Default: Generate/Other POSTs (pass through if needed, currently generation is auto)
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Certificate API Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
};
