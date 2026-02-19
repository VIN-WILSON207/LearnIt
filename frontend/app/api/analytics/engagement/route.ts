import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(request: NextRequest) {
    try {
        const backendRes = await fetch(`${BACKEND_BASE}/api/analytics/engagement`, {
            method: 'GET',
            headers: {
                Authorization: request.headers.get('authorization') || '',
            },
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error('Error fetching engagement metrics proxy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
