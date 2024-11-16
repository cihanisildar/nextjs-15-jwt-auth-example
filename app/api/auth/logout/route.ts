// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken } from '@/lib/jwt'; // Ensure this function is async
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get('refresh_token')?.value;

    // If there's a valid refresh token, increment the token version to invalidate all sessions
    if (refresh_token) {
      const decoded = await verifyRefreshToken(refresh_token); // Await the verification
      if (decoded) {
        await prisma.user.update({
          where: { id: decoded.id },
          data: { tokenVersion: { increment: 1 } },
        });
      }
    }

    // Clear cookies
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}