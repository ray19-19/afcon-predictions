'use client';

import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { MatchWithPrediction } from '@/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function HomePage() {
  const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    checkAuth();
    fetchMatches();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      setIsLoggedIn(res.ok);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionSubmit = async (matchId: number, homeScore: number, awayScore: number) => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }),
      });

      if (res.ok) {
        fetchMatches();
      } else {
        const error = await res.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (filter === 'scheduled') return match.status === 'SCHEDULED';
    if (filter === 'finished') return match.status === 'FINISHED';
    return true;
  });

  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = new Date(match.match_date).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(match);
    return groups;
  }, {} as Record<string, MatchWithPrediction[]>);

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
            Loading matches...
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
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AFCON 2025 Matches
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
          Predict match scores and compete with your friends! 🏆
        </p>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 mb-10 justify-center"
      >
        <FilterButton
          label="All Matches"
          icon={<FiCalendar />}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={matches.length}
        />
        <FilterButton
          label="Upcoming"
          icon={<FiClock />}
          active={filter === 'scheduled'}
          onClick={() => setFilter('scheduled')}
          count={matches.filter((m) => m.status === 'SCHEDULED').length}
        />
        <FilterButton
          label="Results"
          icon={<FiCheckCircle />}
          active={filter === 'finished'}
          onClick={() => setFilter('finished')}
          count={matches.filter((m) => m.status === 'FINISHED').length}
        />
      </motion.div>

      {/* Matches by Date */}
      {Object.keys(groupedMatches).length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="text-6xl mb-4">⚽</div>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">No matches yet</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Check back soon for upcoming fixtures!</p>
          {!isLoggedIn && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg text-lg"
            >
              Register to Make Predictions
            </motion.a>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-12"
        >
          {Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date}>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-black mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-3"
              >
                <span className="inline-block w-2 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                {date}
              </motion.h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dateMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPredictionSubmit={handlePredictionSubmit}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Filter Button Component
function FilterButton({
  label,
  icon,
  active,
  onClick,
  count,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
        }`}
    >
      {icon}
      {label}
      <span
        className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${active ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-700'
          }`}
      >
        {count}
      </span>
    </motion.button>
  );
}
