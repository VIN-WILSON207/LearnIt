import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:5000';

export async function GET(request: NextRequest) {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/subscriptions/plans`, {
            cache: 'no-store'
        });

        // We can just pipe the status and body
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}
