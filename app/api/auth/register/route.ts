// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database with all required fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name, 
        tokenVersion: 0,
      },
    });

    // Generate tokens for the newly created user
    const { auth_token, refresh_token } = await generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set auth and refresh tokens in cookies
    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', auth_token, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const { password: _, ...userWithoutPassword } = user; // Exclude password from response
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}