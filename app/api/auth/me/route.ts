import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = getCurrentUser(request);

        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                userId: user.userId,
                username: user.username,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
