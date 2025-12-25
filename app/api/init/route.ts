import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

// GET /api/init - Initialize database tables
export async function GET() {
    try {
        const result = await initDatabase();

        if (result.success) {
            return NextResponse.json({ message: 'Database initialized successfully' });
        } else {
            return NextResponse.json(
                { error: 'Failed to initialize database', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Init error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize database' },
            { status: 500 }
        );
    }
}
