import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Corrected import to use db from lib/db
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        requireAdmin(request);

        // Fetch all users
        const result = await db`
            SELECT id, username, is_admin, created_at
            FROM users
            ORDER BY username ASC
        `;

        return NextResponse.json({ users: result.rows });
    } catch (error: any) {
        if (error.message === 'Forbidden: Admin access required' || error.message === 'Unauthorized') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
