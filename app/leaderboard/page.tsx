'use client';

import { useEffect, useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';
import { LeaderboardEntry } from '@/types';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

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
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Loading leaderboard...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                    🏆 Leaderboard
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
                    See who's leading the prediction league!
                </p>
            </motion.div>

            <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserId} />

            {/* Scoring System Info */}
            <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8 shadow-xl"
            >
                <h2 className="font-black text-2xl mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Scoring System
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ScoreCard
                        points={5}
                        label="Exact Score"
                        color="from-green-500 to-emerald-600"
                        emoji="🎯"
                    />
                    <ScoreCard
                        points={3}
                        label="Winner + Goal Diff"
                        color="from-blue-500 to-indigo-600"
                        emoji="🎲"
                    />
                    <ScoreCard
                        points={1}
                        label="Winner Only"
                        color="from-yellow-500 to-orange-600"
                        emoji="👍"
                    />
                    <ScoreCard points={0} label="Incorrect" color="from-gray-400 to-gray-600" emoji="😅" />
                </div>
            </motion.div>
        </div>
    );
}

function ScoreCard({
    points,
    label,
    color,
    emoji,
}: {
    points: number;
    label: string;
    color: string;
    emoji: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-gradient-to-br ${color} text-white p-6 rounded-xl shadow-lg`}
        >
            <div className="text-4xl mb-2">{emoji}</div>
            <div className="text-4xl font-black mb-1">{points}</div>
            <div className="text-sm font-semibold opacity-90">{label}</div>
        </motion.div>
    );
}
