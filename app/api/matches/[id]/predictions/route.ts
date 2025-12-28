import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/matches/[id]/predictions - Get all predictions for a match
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if match exists
        const matchResult = await db`
      SELECT id, kickoff_time, status FROM matches WHERE id = ${id}
    `;

        if (matchResult.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        const match = matchResult.rows[0];

        // Only allow viewing predictions after match has started
        const kickoffTime = new Date(match.kickoff_time);
        const now = new Date();

        if (now < kickoffTime) {
            return NextResponse.json(
                { error: 'Predictions are not viewable until match starts' },
                { status: 403 }
            );
        }

        // Get all predictions for this match with user info
        const result = await db`
      SELECT 
        p.id,
        p.predicted_home_score,
        p.predicted_away_score,
        p.points,
        p.created_at,
        u.username
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      WHERE p.match_id = ${id}
      ORDER BY p.points DESC NULLS LAST, p.created_at ASC
    `;

        return NextResponse.json({
            predictions: result.rows,
            match_status: match.status
        });

    } catch (error) {
        console.error('Get match predictions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch predictions' },
            { status: 500 }
        );
    }
}
