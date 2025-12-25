import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { calculatePoints } from '@/lib/scoring';

// POST /api/matches/[id]/score - Submit final score (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        const { id } = await params;

        const { home_score, away_score } = await request.json();

        // Validation
        if (typeof home_score !== 'number' || typeof away_score !== 'number') {
            return NextResponse.json(
                { error: 'Home score and away score must be numbers' },
                { status: 400 }
            );
        }

        if (home_score < 0 || away_score < 0 || home_score > 50 || away_score > 50) {
            return NextResponse.json(
                { error: 'Scores must be between 0 and 50' },
                { status: 400 }
            );
        }

        // Update match with final score
        const matchResult = await db`
      UPDATE matches
      SET 
        home_score = ${home_score},
        away_score = ${away_score},
        status = 'FINISHED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

        if (matchResult.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        // Get all predictions for this match
        const predictions = await db`
      SELECT * FROM predictions WHERE match_id = ${id}
    `;

        // Calculate points for each prediction
        let updatedCount = 0;
        for (const prediction of predictions.rows) {
            const points = calculatePoints(
                prediction.predicted_home_score,
                prediction.predicted_away_score,
                home_score,
                away_score
            );

            await db`
        UPDATE predictions
        SET points = ${points}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${prediction.id}
      `;

            updatedCount++;
        }

        return NextResponse.json({
            message: 'Score submitted successfully',
            match: matchResult.rows[0],
            predictions_updated: updatedCount,
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Submit score error:', error);
        return NextResponse.json(
            { error: 'Failed to submit score' },
            { status: 500 }
        );
    }
}
