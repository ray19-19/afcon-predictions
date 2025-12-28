'use client';

import { LeaderboardEntry } from '@/types';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAward } from 'react-icons/fi';

interface LeaderboardTableProps {
    leaderboard: LeaderboardEntry[];
    currentUserId?: number;
}

export default function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    // Podium order: 2nd, 1st, 3rd
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
        <div className="space-y-8">
            {/* Podium View for Top 3 */}
            {top3.length > 0 && (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    {podiumOrder.map((entry, visualIndex) => {
                        if (!entry) return null;
                        const actualRank = entry === top3[0] ? 1 : entry === top3[1] ? 2 : 3;
                        const heightClass = actualRank === 1 ? 'md:h-72' : actualRank === 2 ? 'md:h-64' : 'md:h-56';
                        const gradientClass =
                            actualRank === 1
                                ? 'from-yellow-400 to-yellow-600'
                                : actualRank === 2
                                    ? 'from-gray-300 to-gray-500'
                                    : 'from-orange-400 to-orange-600';

                        return (
                            <motion.div
                                key={entry.id}
                                variants={fadeInUp}
                                className={`relative ${heightClass} ${visualIndex === 1 ? 'order-first md:order-none' : ''
                                    } ${entry.id === currentUserId ? 'ring-4 ring-blue-500' : ''}`}
                            >
                                <div
                                    className={`h-full bg-gradient-to-br ${gradientClass} rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-between text-white relative overflow-hidden`}
                                >
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl" />

                                    {/* Content */}
                                    <div className="relative z-10 text-center w-full">
                                        {/* Rank Badge */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', delay: 0.2 }}
                                            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 border-4 border-white/40"
                                        >
                                            <span className="text-4xl">
                                                {actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉'}
                                            </span>
                                        </motion.div>

                                        {/* Username */}
                                        <h3 className="text-2xl font-black mb-2 drop-shadow-lg">{entry.username}</h3>

                                        {entry.id === currentUserId && (
                                            <span className="inline-block bg-white/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
                                                YOU
                                            </span>
                                        )}

                                        {/* Points */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', delay: 0.4 }}
                                            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4"
                                        >
                                            <div className="text-5xl font-black mb-1">{entry.total_points}</div>
                                            <div className="text-sm font-semibold opacity-90">POINTS</div>
                                            <div className="text-xs opacity-75 mt-2">{entry.total_predictions} predictions</div>
                                        </motion.div>
                                    </div>

                                    {/* Rank Number */}
                                    <div className="absolute top-4 right-4 text-6xl font-black opacity-10">#{actualRank}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Rest of Leaderboard (Table View) */}
            {rest.length > 0 && (
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Player
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Predictions
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Points
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {rest.map((entry, index) => {
                                    const rank = index + 4; // Starts from 4th place
                                    const isCurrentUser = entry.id === currentUserId;

                                    return (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`${isCurrentUser
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                } transition-all cursor-pointer`}
                                        >
                                            {/* Rank */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg text-gray-700 dark:text-gray-300">
                                                        {rank}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Username */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                        {entry.username}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Predictions Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                    {entry.total_predictions}
                                                </span>
                                            </td>

                                            {/* Points */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-black text-lg shadow-md">
                                                    {entry.total_points}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {leaderboard.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        No players yet!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Be the first to make a prediction and climb the leaderboard
                    </p>
                </motion.div>
            )}
        </div>
    );
}
