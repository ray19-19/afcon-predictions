'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminEnterScoresPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch('/api/matches?status=SCHEDULED');
            const data = await res.json();

            // Filter matches that need scores (kickoff has passed)
            const now = new Date();
            const needingScores = data.matches.filter((m: Match) => {
                const kickoff = new Date(m.kickoff_time);
                return kickoff < now && m.home_score === null;
            });

            setMatches(needingScores);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitScore = async (matchId: number, homeScore: number, awayScore: number) => {
        if (!confirm('Submit this score? Points will be calculated for all predictions.')) {
            return;
        }

        setSubmitting(matchId);

        try {
            const res = await fetch(`/api/matches/${matchId}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ home_score: homeScore, away_score: awayScore }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Score submitted! ${data.predictions_updated} predictions updated.`);
                fetchMatches(); // Refresh list
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to submit score');
            }
        } catch (error) {
            alert('Failed to submit score');
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Enter Match Scores</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Submit final scores for finished matches
                </p>
            </div>

            {matches.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No matches need scores at this time.
                    </p>
                    <button
                        onClick={() => router.push('/admin')}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map((match) => (
                        <ScoreEntryCard
                            key={match.id}
                            match={match}
                            onSubmit={handleSubmitScore}
                            isSubmitting={submitting === match.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ScoreEntryCard({
    match,
    onSubmit,
    isSubmitting,
}: {
    match: Match;
    onSubmit: (matchId: number, homeScore: number, awayScore: number) => void;
    isSubmitting: boolean;
}) {
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {match.competition} • {new Date(match.kickoff_time).toLocaleString()}
                    </div>
                    <div className="text-lg font-bold">
                        {match.home_team} vs {match.away_team}
                    </div>
                    {match.venue && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            📍 {match.venue}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold">{match.home_team}:</label>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={homeScore}
                            onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                            disabled={isSubmitting}
                            className="w-16 px-2 py-1  border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center font-bold"
                        />
                    </div>

                    <span className="font-bold text-lg">-</span>

                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={awayScore}
                            onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                            disabled={isSubmitting}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center font-bold"
                        />
                        <label className="text-sm font-semibold">{match.away_team}</label>
                    </div>

                    <button
                        onClick={() => onSubmit(match.id, homeScore, awayScore)}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Score'}
                    </button>
                </div>
            </div>
        </div>
    );
}
