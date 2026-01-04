import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Corrected import to use db from lib/db
import { requireAdmin, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify admin access
        requireAdmin(request);

        const { userId, password } = await request.json();

        if (!userId || !password) {
            return NextResponse.json({ error: 'User ID and password are required' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        // Update password
        await db`
            UPDATE users
            SET password_hash = ${hashedPassword}
            WHERE id = ${userId}
        `;

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        if (error.message === 'Forbidden: Admin access required' || error.message === 'Unauthorized') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
