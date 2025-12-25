'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCreateMatchPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        home_team: '',
        away_team: '',
        competition: 'AFCON 2025',
        venue: '',
        match_date: '',
        kickoff_time: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const payload = {
                ...formData,
                kickoff_time: new Date(formData.kickoff_time).toISOString(),
            };

            const res = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({
                    home_team: '',
                    away_team: '',
                    competition: 'AFCON 2025',
                    venue: '',
                    match_date: '',
                    kickoff_time: '',
                });
                setTimeout(() => router.push('/admin'), 1500);
            } else {
                setError(data.error || 'Failed to create match');
            }
        } catch (error) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Create New Match</h1>
                    <p className="text-gray-600 dark:text-gray-400">Add a match for users to predict</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
                                Match created successfully! Redirecting...
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Home Team *</label>
                                <input
                                    type="text"
                                    value={formData.home_team}
                                    onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    placeholder="e.g., Morocco"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Away Team *</label>
                                <input
                                    type="text"
                                    value={formData.away_team}
                                    onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    placeholder="e.g., Egypt"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Competition</label>
                            <input
                                type="text"
                                value={formData.competition}
                                onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                placeholder="e.g., AFCON 2025, World Cup"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Venue (Optional)</label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                placeholder="e.g., Mohammed V Stadium, Casablanca"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Match Date *</label>
                                <input
                                    type="date"
                                    value={formData.match_date}
                                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Kickoff Time *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.kickoff_time}
                                    onChange={(e) => setFormData({ ...formData, kickoff_time: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Match'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/admin')}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
