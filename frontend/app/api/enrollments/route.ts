import { mockEnrollments } from '@/lib/mockData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (studentId) {
      const enrollments = mockEnrollments.filter(
        (e) => e.studentId === studentId
      );
      return NextResponse.json(enrollments, { status: 200 });
    }

    return NextResponse.json(mockEnrollments, { status: 200 });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const enrollment = await request.json();
    
    const newEnrollment = {
      id: String(mockEnrollments.length + 1),
      ...enrollment,
    };

    mockEnrollments.push(newEnrollment);
    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
