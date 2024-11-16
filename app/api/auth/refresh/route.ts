// app/api/auth/refresh/route.ts
import { AuthError, TokenService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get('refresh_token')?.value;
    console.log('Incoming Headers:', request.headers);

    if (!refresh_token) {
      throw new AuthError('no_refresh_token', 'No refresh token provided');
    }

    // Verify the refresh token
    const decoded = await TokenService.verifyRefreshToken(refresh_token);

    // Check if user exists and token version matches
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.tokenVersion !== decoded.version) {
      throw new AuthError('invalid_token_version', 'Token has been revoked');
    }

    // Generate new tokens
    const tokens = await TokenService.generateTokens(user);
    
    // Create response with new tokens
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    // Set new cookies
    return TokenService.setCookies(response, tokens);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.code }, { status: 401 });
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
