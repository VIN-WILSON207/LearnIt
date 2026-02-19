import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:4000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward to backend
        const backendResponse = await fetch(`${BACKEND_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.error || 'Registration failed' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Registration proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
