'use client';

import { useEffect, useState } from 'react';
import { PredictionWithMatch } from '@/types';

export default function PredictionsPage() {
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const res = await fetch('/api/predictions');
            if (res.ok) {
                const data = await res.json();
                setPredictions(data.predictions || []);
            }
        } catch (error) {
            console.error('Failed to fetch predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading your predictions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Predictions</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View all your predictions and earned points
                </p>
            </div>

            {predictions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                        You haven't made any predictions yet!
                    </p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        Go to Matches
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {predictions.map((prediction) => (
                        <div
                            key={prediction.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Match Info */}
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        {prediction.competition} • {new Date(prediction.match_date).toLocaleDateString()}
                                    </div>
                                    <div className="text-lg font-bold mb-2">
                                        {prediction.home_team} vs {prediction.away_team}
                                    </div>
                                    {prediction.venue && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            📍 {prediction.venue}
                                        </div>
                                    )}
                                </div>

                                {/* Prediction */}
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Your Prediction
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {prediction.predicted_home_score} - {prediction.predicted_away_score}
                                        </div>
                                    </div>

                                    {/* Actual Score (if match finished) */}
                                    {prediction.status === 'FINISHED' && prediction.home_score !== null && (
                                        <>
                                            <div className="text-gray-400">→</div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Actual Score
                                                </div>
                                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {prediction.home_score} - {prediction.away_score}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Points */}
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Points</div>
                                        <div
                                            className={`text-3xl font-bold ${prediction.points === 5
                                                    ? 'text-green-600'
                                                    : prediction.points === 3
                                                        ? 'text-blue-600'
                                                        : prediction.points === 1
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-500'
                                                }`}
                                        >
                                            {prediction.status === 'FINISHED' ? `+${prediction.points}` : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-4 flex justify-end">
                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${prediction.status === 'FINISHED'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : prediction.status === 'LIVE'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {prediction.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
