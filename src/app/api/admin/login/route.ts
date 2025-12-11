import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Default credentials (huangfeng / admin123)
const DEFAULT_USERNAME = 'huangfeng';
// Hash for 'admin123'
const DEFAULT_PASSWORD_HASH = '$2a$10$HYNQiG80lvPvygUqh3xgre3nvyEniVfxVdZDe05h24rSfdMS6R7wa';

const JWT_SECRET = process.env.JWT_SECRET || 'bilingual-praise-songs-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const envUsername = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
    
    // Validate username
    if (username !== envUsername) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate password
    let isValidPassword = false;
    
    if (process.env.ADMIN_PASSWORD) {
      // If plain text password is provided in env (simpler for deployment)
      isValidPassword = password === process.env.ADMIN_PASSWORD;
    } else {
      // Fallback to hashed password (default or from env)
      const passwordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
      isValidPassword = await bcrypt.compare(password, passwordHash);
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { username, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
