'use client';

import { MatchWithPrediction } from '@/types';
import { useState, useEffect } from 'react';

interface MatchCardProps {
    match: MatchWithPrediction;
    onPredictionSubmit?: (matchId: number, homeScore: number, awayScore: number) => Promise<void>;
    isLoggedIn: boolean;
}

export default function MatchCard({ match, onPredictionSubmit, isLoggedIn }: MatchCardProps) {
    const [homeScore, setHomeScore] = useState(match.user_prediction?.predicted_home_score ?? 0);
    const [awayScore, setAwayScore] = useState(match.user_prediction?.predicted_away_score ?? 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const kickoffTime = new Date(match.kickoff_time);
    const [now, setNow] = useState(new Date());
    const hasStarted = now >= kickoffTime;
    const isFinished = match.status === 'FINISHED';

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async () => {
        if (!onPredictionSubmit) return;

        setIsSubmitting(true);
        try {
            await onPredictionSubmit(match.id, homeScore, awayScore);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Competition Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full">
                    {match.competition}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isFinished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    hasStarted ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {match.status}
                </span>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Home Team */}
                <div className="text-center">
                    <div className="font-bold text-lg mb-2">{match.home_team}</div>
                    {isFinished && match.home_score !== null && (
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{match.home_score}</div>
                    )}
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                    <span className="text-gray-400 font-semibold">VS</span>
                </div>

                {/* Away Team */}
                <div className="text-center">
                    <div className="font-bold text-lg mb-2">{match.away_team}</div>
                    {isFinished && match.away_score !== null && (
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{match.away_score}</div>
                    )}
                </div>
            </div>

            {/* Date & Time */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div>{kickoffTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div>{kickoffTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                {match.venue && <div className="text-xs mt-1">{match.venue}</div>}
            </div>

            {/* Prediction Area */}
            {isLoggedIn && !isFinished && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-sm font-semibold mb-2">Your Prediction</div>

                    {hasStarted ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            {match.user_prediction ? (
                                <div>
                                    <span className="font-bold text-lg">
                                        {match.user_prediction.predicted_home_score} - {match.user_prediction.predicted_away_score}
                                    </span>
                                    <div className="text-xs mt-1">(Locked)</div>
                                </div>
                            ) : (
                                <span>Match has started - predictions locked</span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm">{match.home_team}:</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={homeScore}
                                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <span className="font-bold">-</span>

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={awayScore}
                                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                                    disabled={isSubmitting}
                                />
                                <label className="text-sm">{match.away_team}</label>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Saving...' : match.user_prediction ? 'Update' : 'Submit'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Show user's prediction and points if finished */}
            {isLoggedIn && isFinished && match.user_prediction && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Your prediction: </span>
                            <span className="font-bold">
                                {match.user_prediction.predicted_home_score} - {match.user_prediction.predicted_away_score}
                            </span>
                        </div>
                        <div className={`font-bold text-lg ${match.user_prediction.points === 5 ? 'text-green-600' :
                            match.user_prediction.points === 3 ? 'text-blue-600' :
                                match.user_prediction.points === 1 ? 'text-yellow-600' :
                                    'text-gray-500'
                            }`}>
                            +{match.user_prediction.points} pts
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
