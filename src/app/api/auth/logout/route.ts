import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ApiResponse } from '@/types';

/**
 * Handles user logout by clearing the session cookie
 * @returns JSON response confirming logout
 */
export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    // Clear session cookie
    const cookieStore = cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}