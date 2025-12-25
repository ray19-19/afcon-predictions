import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const result = await db`
      SELECT id, username, password_hash, is_admin
      FROM users
      WHERE username = ${username}
    `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            username: user.username,
            is_admin: user.is_admin,
        });

        // Create response with token in cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin,
            },
            token,
        });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Failed to login' },
            { status: 500 }
        );
    }
}
