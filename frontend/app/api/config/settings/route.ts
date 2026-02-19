import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendRes = await fetch(`${BACKEND_BASE}/api/config/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: request.headers.get('authorization') || '',
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error('Error updating settings proxy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
