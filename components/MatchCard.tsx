'use client';

import { MatchWithPrediction } from '@/types';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, hoverLift, buttonTap } from '@/lib/animations';
import { showPredictionSaved, showError } from '@/lib/notifications';
import { FiClock, FiMapPin, FiTrendingUp, FiEye, FiEyeOff } from 'react-icons/fi';

interface MatchCardProps {
    match: MatchWithPrediction;
    onPredictionSubmit?: (matchId: number, homeScore: number, awayScore: number) => Promise<void>;
    isLoggedIn: boolean;
}

interface MatchPrediction {
    id: number;
    username: string;
    predicted_home_score: number;
    predicted_away_score: number;
    points: number | null;
}

export default function MatchCard({ match, onPredictionSubmit, isLoggedIn }: MatchCardProps) {
    const [homeScore, setHomeScore] = useState(match.user_prediction?.predicted_home_score ?? 0);
    const [awayScore, setAwayScore] = useState(match.user_prediction?.predicted_away_score ?? 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);
    const [allPredictions, setAllPredictions] = useState<MatchPrediction[]>([]);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [timeUntilKickoff, setTimeUntilKickoff] = useState<string>('');

    const kickoffTime = new Date(match.kickoff_time);
    const [now, setNow] = useState(new Date());
    const hasStarted = now >= kickoffTime;
    const isFinished = match.status === 'FINISHED';

    // Update countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const newNow = new Date();
            setNow(newNow);

            if (!hasStarted && !isFinished) {
                const diff = kickoffTime.getTime() - newNow.getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) {
                    setTimeUntilKickoff(`${days}d ${hours}h`);
                } else if (hours > 0) {
                    setTimeUntilKickoff(`${hours}h ${minutes}m`);
                } else if (minutes > 0) {
                    setTimeUntilKickoff(`${minutes}m`);
                } else {
                    setTimeUntilKickoff('Starting soon...');
                }
            }
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [hasStarted, isFinished, kickoffTime]);

    const handleSubmit = async () => {
        if (!onPredictionSubmit) return;

        setIsSubmitting(true);
        try {
            await onPredictionSubmit(match.id, homeScore, awayScore);
            showPredictionSaved();
        } catch (error) {
            showError('Failed to save prediction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const fetchAllPredictions = async () => {
        if (allPredictions.length > 0) {
            setShowPredictions(!showPredictions);
            return;
        }

        setLoadingPredictions(true);
        try {
            const res = await fetch(`/api/matches/${match.id}/predictions`);
            if (res.ok) {
                const data = await res.json();
                setAllPredictions(data.predictions);
                setShowPredictions(true);
            }
        } catch (error) {
            console.error('Failed to fetch predictions:', error);
        } finally {
            setLoadingPredictions(false);
        }
    };

    // Determine card styling based on status
    const getCardStyle = () => {
        if (isFinished) {
            return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-900';
        }
        if (hasStarted) {
            return 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border-2 border-yellow-300 dark:border-yellow-700 shadow-yellow-200/50 dark:shadow-yellow-900/50';
        }
        return 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700';
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            whileHover={!isFinished ? hoverLift : undefined}
            className={`${getCardStyle()} rounded-xl shadow-lg p-6 transition-all duration-300 relative overflow-hidden`}
        >
            {/* Gradient overlay for finished matches */}
            {isFinished && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 pointer-events-none" />
            )}

            {/* Status Badge with Animation */}
            <div className="flex justify-between items-start mb-4 relative">
                <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                >
                    ⚽ {match.competition}
                </motion.span>

                <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-md ${isFinished
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : hasStarted
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                >
                    {match.status}
                </motion.span>
            </div>

            {/* Teams Section */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Home Team */}
                <div className="text-center space-y-2">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        {match.home_team}
                    </motion.div>
                    {isFinished && match.home_score !== null && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-5xl font-black text-blue-600 dark:text-blue-400"
                        >
                            {match.home_score}
                        </motion.div>
                    )}
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-300 dark:text-gray-600">VS</span>
                    {!isFinished && !hasStarted && timeUntilKickoff && (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1 mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400"
                        >
                            <FiClock className="w-3 h-3" />
                            {timeUntilKickoff}
                        </motion.div>
                    )}
                </div>

                {/* Away Team */}
                <div className="text-center space-y-2">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    >
                        {match.away_team}
                    </motion.div>
                    {isFinished && match.away_score !== null && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="text-5xl font-black text-purple-600 dark:text-purple-400"
                        >
                            {match.away_score}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Match Info */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                <div className="font-medium">
                    {kickoffTime.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                    {' • '}
                    {kickoffTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {match.venue && (
                    <div className="flex items-center justify-center gap-1 text-xs">
                        <FiMapPin className="w-3 h-3" />
                        {match.venue}
                    </div>
                )}
            </div>

            {/* Prediction Section */}
            {isLoggedIn && !isFinished && (
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Your Prediction
                        </span>
                        {match.user_prediction && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-semibold">
                                Saved ✓
                            </span>
                        )}
                    </div>

                    {hasStarted ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg py-4"
                        >
                            {match.user_prediction ? (
                                <div>
                                    <span className="font-black text-2xl text-yellow-700 dark:text-yellow-400">
                                        {match.user_prediction.predicted_home_score} - {match.user_prediction.predicted_away_score}
                                    </span>
                                    <div className="text-xs mt-2 font-semibold text-yellow-600 dark:text-yellow-500">
                                        🔒 Locked
                                    </div>
                                </div>
                            ) : (
                                <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                                    Match started - predictions locked
                                </span>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    {match.home_team}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={homeScore}
                                    onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                                    onFocus={handleInputFocus}
                                    className="w-14 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-center font-bold text-lg focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <span className="font-black text-2xl text-gray-400">-</span>

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={awayScore}
                                    onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                                    onFocus={handleInputFocus}
                                    className="w-14 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-center font-bold text-lg focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    disabled={isSubmitting}
                                />
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    {match.away_team}
                                </label>
                            </div>

                            <motion.button
                                whileTap={buttonTap}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                            >
                                {isSubmitting ? '💾' : match.user_prediction ? '↻ Update' : '✓ Submit'}
                            </motion.button>
                        </div>
                    )}
                </div>
            )}

            {/* User's Score (if finished) */}
            {isLoggedIn && isFinished && match.user_prediction && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t-2 border-gray-200 dark:border-gray-700 pt-5 mt-5"
                >
                    <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                Your prediction:
                            </span>
                            <span className="ml-2 font-black text-lg">
                                {match.user_prediction.predicted_home_score} - {match.user_prediction.predicted_away_score}
                            </span>
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className={`font-black text-2xl px-4 py-2 rounded-lg ${match.user_prediction.points === 5
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                    : match.user_prediction.points === 3
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                        : match.user_prediction.points === 1
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            +{match.user_prediction.points}
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* View All Predictions */}
            {hasStarted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t-2 border-gray-200 dark:border-gray-700 pt-5 mt-5"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={buttonTap}
                        onClick={fetchAllPredictions}
                        disabled={loadingPredictions}
                        className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {loadingPredictions ? (
                            '⏳ Loading...'
                        ) : showPredictions ? (
                            <>
                                <FiEyeOff /> Hide All Predictions
                            </>
                        ) : (
                            <>
                                <FiEye /> View All Predictions
                            </>
                        )}
                    </motion.button>

                    {showPredictions && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar"
                        >
                            {allPredictions.length > 0 ? (
                                allPredictions.map((pred, index) => (
                                    <motion.div
                                        key={pred.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                    >
                                        <span className="font-bold text-sm">{pred.username}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold">
                                                {pred.predicted_home_score} - {pred.predicted_away_score}
                                            </span>
                                            {isFinished && pred.points !== null && (
                                                <span
                                                    className={`font-bold text-sm px-3 py-1 rounded-full ${pred.points === 5
                                                            ? 'bg-green-500 text-white'
                                                            : pred.points === 3
                                                                ? 'bg-blue-500 text-white'
                                                                : pred.points === 1
                                                                    ? 'bg-yellow-500 text-white'
                                                                    : 'bg-gray-400 text-white'
                                                        }`}
                                                >
                                                    +{pred.points}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
                                    No predictions yet
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
