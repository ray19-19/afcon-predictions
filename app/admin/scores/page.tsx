'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/types';
import { useRouter } from 'next/navigation';

export default function AdminEnterScoresPage() {
    const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
    const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            // Fetch all matches to handle corrections
            const res = await fetch('/api/matches');
            const data = await res.json();

            const now = new Date();

            // Pending: Scheduled/Live matches past kickoff or explicitly LIVE
            const pending = data.matches.filter((m: Match) => {
                const kickoff = new Date(m.kickoff_time);
                return (m.status === 'SCHEDULED' && kickoff < now) || m.status === 'LIVE';
            });

            // Finished: Matches with FINISHED status
            const finished = data.matches.filter((m: Match) => {
                return m.status === 'FINISHED';
            }).sort((a: Match, b: Match) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime());

            setPendingMatches(pending);
            setFinishedMatches(finished);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitScore = async (matchId: number, homeScore: number, awayScore: number) => {
        if (!confirm('Submit this score? Points will be RECALCULATED for all predictions.')) {
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
                    Submit final scores. Updating a finished match will recalculate points.
                </p>
            </div>

            {/* Pending Scores Section */}
            <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full uppercase">Pending</span>
                    Matches Awaiting Scores
                </h2>

                {pendingMatches.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            No pending matches to score.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingMatches.map((match) => (
                            <ScoreEntryCard
                                key={match.id}
                                match={match}
                                onSubmit={handleSubmitScore}
                                isSubmitting={submitting === match.id}
                                defaultHome={match.home_score ?? 0}
                                defaultAway={match.away_score ?? 0}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Finished Matches Section (For Corrections) */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase">Finished</span>
                    Completed Matches (Corrections)
                </h2>

                {finishedMatches.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No finished matches yet.</div>
                ) : (
                    <div className="space-y-4 opacity-90 hover:opacity-100 transition-opacity">
                        {finishedMatches.map((match) => (
                            <ScoreEntryCard
                                key={match.id}
                                match={match}
                                onSubmit={handleSubmitScore}
                                isSubmitting={submitting === match.id}
                                defaultHome={match.home_score ?? 0}
                                defaultAway={match.away_score ?? 0}
                                isFinished={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => router.push('/admin')}
                className="mt-8 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
            >
                Back to Dashboard
            </button>
        </div>
    );
}

function ScoreEntryCard({
    match,
    onSubmit,
    isSubmitting,
    defaultHome,
    defaultAway,
    isFinished = false,
}: {
    match: Match;
    onSubmit: (matchId: number, homeScore: number, awayScore: number) => void;
    isSubmitting: boolean;
    defaultHome: number;
    defaultAway: number;
    isFinished?: boolean;
}) {
    const [homeScore, setHomeScore] = useState(defaultHome);
    const [awayScore, setAwayScore] = useState(defaultAway);
    const [isDirty, setIsDirty] = useState(false);

    const handleHomeChange = (val: number) => {
        setHomeScore(val);
        setIsDirty(true);
    };

    const handleAwayChange = (val: number) => {
        setAwayScore(val);
        setIsDirty(true);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${isFinished ? 'border-green-500' : 'border-yellow-500'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {match.competition} • {new Date(match.kickoff_time).toLocaleString()}
                        {isFinished && <span className="ml-2 text-green-600 font-bold">✓ FINISHED</span>}
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
                            onChange={(e) => handleHomeChange(parseInt(e.target.value) || 0)}
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
                            onChange={(e) => handleAwayChange(parseInt(e.target.value) || 0)}
                            disabled={isSubmitting}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center font-bold"
                        />
                        <label className="text-sm font-semibold">{match.away_team}</label>
                    </div>

                    <button
                        onClick={() => onSubmit(match.id, homeScore, awayScore)}
                        disabled={isSubmitting || (!isDirty && isFinished)}
                        className={`px-6 py-2 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${isFinished ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : isFinished ? 'Update Score' : 'Submit Score'}
                    </button>
                </div>
            </div>
        </div>
    );
}
