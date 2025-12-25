import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { hasMatchStarted, isValidScore } from '@/lib/scoring';

// GET /api/predictions - Get user's predictions
export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);

        const result = await db`
      SELECT 
        p.*,
        m.home_team,
        m.away_team,
        m.competition,
        m.match_date,
        m.kickoff_time,
        m.home_score,
        m.away_score,
        m.status
      FROM predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.user_id = ${user.userId}
      ORDER BY m.kickoff_time DESC
    `;

        return NextResponse.json({ predictions: result.rows });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        console.error('Get predictions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch predictions' },
            { status: 500 }
        );
    }
}

// POST /api/predictions - Submit or update prediction
export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);

        const { match_id, predicted_home_score, predicted_away_score } = await request.json();

        // Validation
        if (!match_id || typeof predicted_home_score !== 'number' || typeof predicted_away_score !== 'number') {
            return NextResponse.json(
                { error: 'Match ID, predicted home score, and predicted away score are required' },
                { status: 400 }
            );
        }

        if (!isValidScore(predicted_home_score) || !isValidScore(predicted_away_score)) {
            return NextResponse.json(
                { error: 'Scores must be integers between 0 and 50' },
                { status: 400 }
            );
        }

        // Check if match exists and get kickoff time
        const matchResult = await db`
      SELECT id, kickoff_time, status FROM matches WHERE id = ${match_id}
    `;

        if (matchResult.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        const match = matchResult.rows[0];

        // Check if match has started
        if (hasMatchStarted(match.kickoff_time)) {
            return NextResponse.json(
                { error: 'Cannot submit prediction after match has started' },
                { status: 400 }
            );
        }

        // Check if match is not scheduled
        if (match.status !== 'SCHEDULED') {
            return NextResponse.json(
                { error: 'Can only predict on scheduled matches' },
                { status: 400 }
            );
        }

        // Insert or update prediction
        const result = await db`
      INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score)
      VALUES (${user.userId}, ${match_id}, ${predicted_home_score}, ${predicted_away_score})
      ON CONFLICT (user_id, match_id)
      DO UPDATE SET
        predicted_home_score = ${predicted_home_score},
        predicted_away_score = ${predicted_away_score},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

        return NextResponse.json({
            message: 'Prediction submitted successfully',
            prediction: result.rows[0],
        }, { status: 201 });

    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        console.error('Submit prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to submit prediction' },
            { status: 500 }
        );
    }
}
