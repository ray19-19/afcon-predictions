import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// PUT /api/matches/[id] - Update match details (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        const { id } = await params;

        const { home_team, away_team, competition, venue, match_date, kickoff_time, status } = await request.json();

        const result = await db`
      UPDATE matches
      SET 
        home_team = COALESCE(${home_team}, home_team),
        away_team = COALESCE(${away_team}, away_team),
        competition = COALESCE(${competition}, competition),
        venue = COALESCE(${venue}, venue),
        match_date = COALESCE(${match_date}, match_date),
        kickoff_time = COALESCE(${kickoff_time}, kickoff_time),
        status = COALESCE(${status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Match updated successfully',
            match: result.rows[0],
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Update match error:', error);
        return NextResponse.json(
            { error: 'Failed to update match' },
            { status: 500 }
        );
    }
}

// DELETE /api/matches/[id] - Delete match (admin only, only if no predictions)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        const { id } = await params;

        // Check if match has predictions
        const predictions = await db`
      SELECT COUNT(*) as count FROM predictions WHERE match_id = ${id}
    `;

        if (predictions.rows[0].count > 0) {
            return NextResponse.json(
                { error: 'Cannot delete match with existing predictions' },
                { status: 400 }
            );
        }

        const result = await db`
      DELETE FROM matches WHERE id = ${id}
      RETURNING id
    `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Match deleted successfully' });

    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Delete match error:', error);
        return NextResponse.json(
            { error: 'Failed to delete match' },
            { status: 500 }
        );
    }
}

// GET /api/matches/[id] - Get single match
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await db`
      SELECT * FROM matches WHERE id = ${id}
    `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json({ match: result.rows[0] });

    } catch (error) {
        console.error('Get match error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match' },
            { status: 500 }
        );
    }
}
