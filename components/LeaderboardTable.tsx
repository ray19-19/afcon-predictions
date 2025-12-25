'use client';

import { LeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
    leaderboard: LeaderboardEntry[];
    currentUserId?: number;
}

export default function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Username
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Predictions
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Points
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {leaderboard.map((entry, index) => {
                            const rank = index + 1;
                            const isCurrentUser = entry.id === currentUserId;
                            const medal = getMedalIcon(rank);

                            return (
                                <tr
                                    key={entry.id}
                                    className={`${isCurrentUser
                                            ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        } transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {medal && <span className="text-2xl">{medal}</span>}
                                            <span className={medal ? 'font-bold text-lg' : ''}>{rank}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {entry.username}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                                        {entry.total_predictions}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`text-lg font-bold ${rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                                                rank === 2 ? 'text-gray-500 dark:text-gray-400' :
                                                    rank === 3 ? 'text-orange-600 dark:text-orange-400' :
                                                        'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {entry.total_points}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {leaderboard.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No players yet. Be the first to make a prediction!
                </div>
            )}
        </div>
    );
}
