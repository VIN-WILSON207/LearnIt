import { mockUsers } from '@/lib/mockData';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get('role');
    
    if (role) {
      const users = mockUsers.filter((u) => u.role === role);
      return NextResponse.json(users, { status: 200 });
    }

    // Return users without passwords
    const usersWithoutPasswords = mockUsers.map(({ password: _, ...user }) => user);
    return NextResponse.json(usersWithoutPasswords, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
