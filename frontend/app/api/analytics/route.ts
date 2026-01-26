import { mockAnalytics } from '@/lib/mockData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(mockAnalytics, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
