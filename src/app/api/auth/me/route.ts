import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { User, ApiResponse } from '@/types';

/**
 * Returns the current authenticated user's information from session
 * @returns JSON response with user data or error if not authenticated
 */
export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user: User = JSON.parse(sessionCookie.value);

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid session' },
      { status: 401 }
    );
  }
}