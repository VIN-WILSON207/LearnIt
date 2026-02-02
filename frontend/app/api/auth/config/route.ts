import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const backendResponse = await fetch('http://localhost:4000/api/auth/config', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to fetch config' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Config proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
