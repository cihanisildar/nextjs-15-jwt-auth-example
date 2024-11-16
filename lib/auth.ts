// lib/auth.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { DecodedRefreshToken, User } from '@/types/auth';

export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenService {
  private static AUTH_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
  private static REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);

  static async generateTokens(user: User) {
    const auth_token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.AUTH_SECRET);

    const refresh_token = await new SignJWT({ 
      id: user.id, 
      version: user.tokenVersion 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.REFRESH_SECRET);

    return { auth_token, refresh_token };
  }

  static async verifyAuthToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.AUTH_SECRET);
      return payload;
    } catch (error) {
      throw new AuthError('invalid_token', 'Invalid or expired auth token');
    }
  }

  static async verifyRefreshToken(token: string): Promise<DecodedRefreshToken> {
    try {
      const { payload } = await jwtVerify(token, this.REFRESH_SECRET);
      return {
        id: payload.id as string,
        version: payload.version as number
      };
    } catch (error) {
      throw new AuthError('invalid_refresh_token', 'Invalid or expired refresh token');
    }
  }

  static setCookies(response: NextResponse, { auth_token, refresh_token }: { auth_token: string, refresh_token: string }) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    response.cookies.set('auth_token', auth_token, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  }
}