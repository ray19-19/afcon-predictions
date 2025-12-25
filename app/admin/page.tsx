'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMatches: 0,
        scheduledMatches: 0,
        finishedMatches: 0,
        totalUsers: 0,
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        fetchStats();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (!data.user.isAdmin) {
                    router.push('/');
                }
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const fetchStats = async () => {
        try {
            const [matchesRes, leaderboardRes] = await Promise.all([
                fetch('/api/matches'),
                fetch('/api/leaderboard'),
            ]);

            const matchesData = await matchesRes.json();
            const leaderboardData = await leaderboardRes.json();

            const matches = matchesData.matches || [];

            setStats({
                totalMatches: matches.length,
                scheduledMatches: matches.filter((m: any) => m.status === 'SCHEDULED').length,
                finishedMatches: matches.filter((m: any) => m.status === 'FINISHED').length,
                totalUsers: leaderboardData.leaderboard?.length || 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">⚙️ Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage matches and view statistics
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Matches" value={stats.totalMatches} icon="⚽" />
                <StatCard title="Scheduled" value={stats.scheduledMatches} icon="📅" color="blue" />
                <StatCard title="Finished" value={stats.finishedMatches} icon="✅" color="green" />
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="purple" />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard
                    title="Create New Match"
                    description="Add a match for users to predict"
                    icon="➕"
                    href="/admin/create-match"
                    color="blue"
                />
                <ActionCard
                    title="Enter Scores"
                    description="Submit final scores and calculate points"
                    icon="🎯"
                    href="/admin/scores"
                    color="green"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color = 'gray' }: { title: string; value: number; icon: string; color?: string }) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        gray: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    };

    return (
        <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

function ActionCard({ title, description, icon, href, color }: { title: string; description: string; icon: string; href: string; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
    };

    return (
        <a
            href={href}
            className={`${colorClasses[color as keyof typeof colorClasses]} text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all block`}
        >
            <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl">{icon}</div>
                <h3 className="text-2xl font-bold">{title}</h3>
            </div>
            <p className="text-blue-100">{description}</p>
        </a>
    );
}
