import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readFileSync } from 'fs';
import { join } from 'path';
import { User, LoginCredentials, ApiResponse } from '@/types';

/**
 * Handles user authentication by validating credentials against predefined test accounts
 * @param request - The incoming HTTP request containing login credentials
 * @returns JSON response with authentication result
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { email, password }: LoginCredentials = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Load users from JSON file
    const usersPath = join(process.cwd(), 'src/data/users.json');
    const usersData = readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    // Find user by email and validate password
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user session data (exclude password)
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      vendorType: user.vendorType,
      name: user.name
    };

    // Set session cookie
    const cookieStore = cookies();
    cookieStore.set('session', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({
      success: true,
      data: sessionUser
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}