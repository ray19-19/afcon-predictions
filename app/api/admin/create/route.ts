import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// POST /api/admin/create - Create admin user with special key
export async function POST(request: NextRequest) {
    try {
        const { username, password, adminKey } = await request.json();

        // Check admin key (you can change this)
        const ADMIN_KEY = process.env.ADMIN_API_KEY || 'admin-secret-afcon-2025-predictions-key';

        if (adminKey !== ADMIN_KEY) {
            return NextResponse.json(
                { error: 'Invalid admin key' },
                { status: 403 }
            );
        }

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 50) {
            return NextResponse.json(
                { error: 'Username must be between 3 and 50 characters' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existing = await db`
      SELECT id FROM users WHERE username = ${username}
    `;

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create admin user
        const result = await db`
      INSERT INTO users (username, password_hash, is_admin)
      VALUES (${username}, ${passwordHash}, true)
      RETURNING id, username, is_admin, created_at
    `;

        const user = result.rows[0];

        return NextResponse.json({
            message: 'Admin user created successfully',
            user: {
                id: user.id,
                username: user.username,
                is_admin: user.is_admin,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Admin creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}
