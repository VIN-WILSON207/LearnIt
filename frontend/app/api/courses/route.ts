import { mockCourses } from '@/lib/mockData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(mockCourses, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const course = await request.json();
    
    // Add a new course to mock data
    const newCourse = {
      id: String(mockCourses.length + 1),
      ...course,
    };

    mockCourses.push(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
