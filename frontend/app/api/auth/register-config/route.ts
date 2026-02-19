import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function GET(request: NextRequest) {
    try {
        const backendResponse = await fetch(`${BACKEND_BASE}/api/auth/config`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to fetch registration configuration' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Registration config proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
