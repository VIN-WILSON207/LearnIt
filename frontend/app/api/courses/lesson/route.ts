import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('[api/courses/lesson] Upload proxy called');
    const token = request.headers.get('authorization') || '';
    const contentType = request.headers.get('content-type') || '';
    // Stream directly to backend to avoid buffering and timeouts
    const backendRes = await fetch(`${BACKEND_BASE}/api/courses/lesson`, {
      method: 'POST',
      headers: {
        Authorization: token,
        ...(contentType ? { 'Content-Type': contentType } : {}),
      },
      body: request.body,
      // @ts-ignore - duplex is required for streaming bodies in Node env
      duplex: 'half',
      signal: AbortSignal.timeout(5 * 60 * 1000), // 5 minute timeout
    });
    console.log('[api/courses/lesson] Backend response status:', backendRes.status);

    const raw = await backendRes.text();
    if (!backendRes.ok) {
      console.error('[api/courses/lesson] Backend error body:', raw);
    }
    let data: any;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { error: raw || 'Unexpected backend response' };
    }
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Error uploading lesson:', error);
    const code = (error as any)?.cause?.code || (error as any)?.code;
    if (code === 'UND_ERR_HEADERS_TIMEOUT' || code === 'UND_ERR_BODY_TIMEOUT') {
      return NextResponse.json(
        { error: 'Upload timed out while waiting for storage response. Please retry with stable internet or a smaller file.' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
