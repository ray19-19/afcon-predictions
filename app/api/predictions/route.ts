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

        // SECURITY: Validate input types
        if (!match_id || typeof predicted_home_score !== 'number' || typeof predicted_away_score !== 'number') {
            return NextResponse.json(
                { error: 'Match ID, predicted home score, and predicted away score are required' },
                { status: 400 }
            );
        }

        // SECURITY: Validate score range
        if (!isValidScore(predicted_home_score) || !isValidScore(predicted_away_score)) {
            return NextResponse.json(
                { error: 'Scores must be integers between 0 and 50' },
                { status: 400 }
            );
        }

        // SECURITY: Use transaction to prevent race conditions
        // Check match exists and get details in single query
        const matchResult = await db`
      SELECT id, kickoff_time, status, home_score, away_score 
      FROM matches 
      WHERE id = ${match_id}
    `;

        if (matchResult.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        const match = matchResult.rows[0];

        // SECURITY CHECK 1: Match must be SCHEDULED
        if (match.status !== 'SCHEDULED') {
            return NextResponse.json(
                { error: 'Cannot predict on matches that are not scheduled' },
                { status: 403 }
            );
        }

        // SECURITY CHECK 2: Match must not have started (server-side time check)
        if (hasMatchStarted(match.kickoff_time)) {
            return NextResponse.json(
                { error: 'Cannot submit prediction after match has started' },
                { status: 403 }
            );
        }

        // SECURITY CHECK 3: Match must not have a final score
        if (match.home_score !== null || match.away_score !== null) {
            return NextResponse.json(
                { error: 'Cannot submit prediction for completed match' },
                { status: 403 }
            );
        }

        // SECURITY: Additional check - ensure kickoff is in the future
        const kickoffTime = new Date(match.kickoff_time);
        const now = new Date();
        const timeUntilKickoff = kickoffTime.getTime() - now.getTime();

        if (timeUntilKickoff <= 0) {
            return NextResponse.json(
                { error: 'Prediction window has closed' },
                { status: 403 }
            );
        }

        // Insert or update prediction with WHERE clause to prevent updates after kickoff
        const result = await db`
      INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score)
      VALUES (${user.userId}, ${match_id}, ${predicted_home_score}, ${predicted_away_score})
      ON CONFLICT (user_id, match_id)
      DO UPDATE SET
        predicted_home_score = ${predicted_home_score},
        predicted_away_score = ${predicted_away_score},
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        predictions.match_id IN (
          SELECT id FROM matches 
          WHERE id = ${match_id} 
          AND status = 'SCHEDULED' 
          AND kickoff_time > CURRENT_TIMESTAMP
          AND home_score IS NULL
          AND away_score IS NULL
        )
      RETURNING *
    `;

        // If no rows returned, the WHERE clause failed (race condition caught!)
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Prediction locked: match has started or status changed' },
                { status: 403 }
            );
        }

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
