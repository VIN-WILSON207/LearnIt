import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:5000';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization') || '';
        const res = await fetch(`${BACKEND_BASE}/api/subscriptions/admin/plans`, {
            headers: { Authorization: token },
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = request.headers.get('authorization') || '';
        const res = await fetch(`${BACKEND_BASE}/api/subscriptions/admin/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
