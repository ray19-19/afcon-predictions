'use client';

import { useEffect, useState } from 'react';
import MatchCard from '@/components/MatchCard';
import { MatchWithPrediction } from '@/types';

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
        // Refresh matches to update prediction
        fetchMatches();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit prediction');
      }
    } catch (error) {
      alert('Failed to submit prediction');
    }
  };

  const filteredMatches = matches.filter(match => {
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AFCON 2025 Matches</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Predict match scores and compete with your friends!
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          All Matches
        </button>
        <button
          onClick={() => setFilter('scheduled')}
          className={`px-4 py-2 rounded-lg font-semibold ${filter === 'scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('finished')}
          className={`px-4 py-2 rounded-lg font-semibold ${filter === 'finished'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          Results
        </button>
      </div>

      {/* Matches by Date */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No matches yet. Check back soon!
          </p>
          {!isLoggedIn && (
            <a href="/register" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
              Register to Make Predictions
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([date, dateMatches]) => (
            <div key={date}>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{date}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dateMatches.map(match => (
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
        </div>
      )}
    </div>
  );
}
