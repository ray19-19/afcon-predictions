import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getCurrentUser } from '@/lib/auth';
import { MatchWithPrediction } from '@/types';

// GET /api/matches - List all matches
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const competition = searchParams.get('competition');

        const user = getCurrentUser(request);
        const userId = user?.userId;

        let query;

        if (userId) {
            // If logged in, include user's predictions
            query = db`
        SELECT 
          m.*,
          p.id as prediction_id,
          p.predicted_home_score,
          p.predicted_away_score,
          p.points
        FROM matches m
        LEFT JOIN predictions p ON m.id = p.match_id AND p.user_id = ${userId}
        WHERE 1=1
        ${status ? db`AND m.status = ${status}` : db``}
        ${competition ? db`AND m.competition = ${competition}` : db``}
        ORDER BY m.kickoff_time ASC
      `;
        } else {
            // If not logged in, just get matches
            query = db`
        SELECT * FROM matches
        WHERE 1=1
        ${status ? db`AND status = ${status}` : db``}
        ${competition ? db`AND competition = ${competition}` : db``}
        ORDER BY kickoff_time ASC
      `;
        }

        const result = await query;

        const matches: MatchWithPrediction[] = result.rows.map((row: any) => ({
            id: row.id,
            home_team: row.home_team,
            away_team: row.away_team,
            competition: row.competition,
            venue: row.venue,
            match_date: row.match_date,
            kickoff_time: row.kickoff_time,
            home_score: row.home_score,
            away_score: row.away_score,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user_prediction: row.prediction_id ? {
                id: row.prediction_id,
                user_id: userId!,
                match_id: row.id,
                predicted_home_score: row.predicted_home_score,
                predicted_away_score: row.predicted_away_score,
                points: row.points,
                created_at: row.created_at,
                updated_at: row.updated_at,
            } : undefined,
        }));

        return NextResponse.json({ matches });

    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches' },
            { status: 500 }
        );
    }
}

// POST /api/matches - Create new match (admin only)
export async function POST(request: NextRequest) {
    try {
        requireAdmin(request);

        const { home_team, away_team, competition, venue, match_date, kickoff_time } = await request.json();

        // Validation
        if (!home_team || !away_team || !match_date || !kickoff_time) {
            return NextResponse.json(
                { error: 'Home team, away team, match date, and kickoff time are required' },
                { status: 400 }
            );
        }

        // Create match
        const result = await db`
      INSERT INTO matches (home_team, away_team, competition, venue, match_date, kickoff_time)
      VALUES (${home_team}, ${away_team}, ${competition || 'AFCON 2025'}, ${venue || null}, ${match_date}, ${kickoff_time})
      RETURNING *
    `;

        return NextResponse.json({
            message: 'Match created successfully',
            match: result.rows[0],
        }, { status: 201 });

    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Create match error:', error);
        return NextResponse.json(
            { error: 'Failed to create match' },
            { status: 500 }
        );
    }
}
