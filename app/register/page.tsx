'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Automatically log in after registration
                const loginRes = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (loginRes.ok) {
                    window.location.href = '/';
                } else {
                    router.push('/login');
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join the prediction league!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={50}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                            placeholder="Re-enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                    <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
}
