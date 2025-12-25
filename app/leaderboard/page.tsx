'use client';

import { useEffect, useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>();

    useEffect(() => {
        checkAuth();
        fetchLeaderboard();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data.user.userId);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    See who's leading the prediction league!
                </p>
            </div>

            <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserId} />

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h2 className="font-bold text-lg mb-3">Scoring System</h2>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                        <span className="font-bold text-green-600 dark:text-green-400">5 points</span>
                        <span>→ Exact score prediction</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">3 points</span>
                        <span>→ Correct winner + goal difference</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="font-bold text-yellow-600 dark:text-yellow-400">1 point</span>
                        <span>→ Correct winner only</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">0 points</span>
                        <span>→ Incorrect prediction</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
