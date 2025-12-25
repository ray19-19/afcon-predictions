'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white shadow-lg">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                        ⚽ AFCON 2025 Predictions
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="hover:text-blue-200 transition-colors">
                            Matches
                        </Link>
                        <Link href="/leaderboard" className="hover:text-blue-200 transition-colors">
                            Leaderboard
                        </Link>

                        {user ? (
                            <>
                                {user.isAdmin && (
                                    <Link href="/admin" className="hover:text-blue-200 transition-colors font-semibold">
                                        Admin
                                    </Link>
                                )}
                                <Link href="/predictions" className="hover:text-blue-200 transition-colors">
                                    My Predictions
                                </Link>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">👤 {user.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-white/20 pt-4">
                        <Link href="/" className="block hover:text-blue-200">
                            Matches
                        </Link>
                        <Link href="/leaderboard" className="block hover:text-blue-200">
                            Leaderboard
                        </Link>

                        {user ? (
                            <>
                                {user.isAdmin && (
                                    <Link href="/admin" className="block hover:text-blue-200 font-semibold">
                                        Admin
                                    </Link>
                                )}
                                <Link href="/predictions" className="block hover:text-blue-200">
                                    My Predictions
                                </Link>
                                <div className="pt-2">
                                    <div className="text-sm mb-2">👤 {user.username}</div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg w-full text-left"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block px-4 py-2 hover:bg-white/20 rounded-lg">
                                    Login
                                </Link>
                                <Link href="/register" className="block px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-center">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
