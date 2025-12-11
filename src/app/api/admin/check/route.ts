import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'bilingual-praise-songs-secret-key';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role === 'admin') {
        return NextResponse.json({
          authenticated: true,
          user: { username: decoded.username, role: decoded.role }
        });
      }
    } catch (jwtError) {
      // Token is invalid
    }

    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}