import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/leaderboard - Get global leaderboard
export async function GET() {
    try {
        const result = await db`
      SELECT 
        u.id,
        u.username,
        COALESCE(SUM(p.points), 0) as total_points,
        COUNT(p.id) as total_predictions
      FROM users u
      LEFT JOIN predictions p ON u.id = p.user_id
      WHERE u.is_admin = false
      GROUP BY u.id, u.username
      ORDER BY total_points DESC, u.username ASC
    `;

        return NextResponse.json({ leaderboard: result.rows });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
