'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiTrendingUp, FiTarget, FiSettings } from 'react-icons/fi';

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
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl backdrop-blur-lg"
        >
            <nav className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2"
                        >
                            <span className="text-3xl">⚽</span>
                            <div>
                                <h1 className="text-2xl font-black">AFCON 2025</h1>
                                <p className="text-xs opacity-90 font-semibold tracking-wide">PREDICTIONS</p>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink href="/" icon={<FiHome />}>
                            Matches
                        </NavLink>
                        <NavLink href="/leaderboard" icon={<FiTrendingUp />}>
                            Leaderboard
                        </NavLink>

                        {user ? (
                            <>
                                {user.isAdmin && (
                                    <NavLink href="/admin" icon={<FiSettings />}>
                                        <span className="flex items-center gap-1">
                                            Admin
                                            <span className="text-yellow-300 animate-pulse">★</span>
                                        </span>
                                    </NavLink>
                                )}
                                <NavLink href="/predictions" icon={<FiTarget />}>
                                    My Predictions
                                </NavLink>
                                <div className="flex items-center gap-4 ml-2">
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                                        <FiUser className="w-4 h-4" />
                                        <span className="font-bold">{user.username}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-colors backdrop-blur-sm flex items-center gap-2"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        Logout
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-5 py-2 hover:bg-white/20 rounded-lg font-bold transition-colors backdrop-blur-sm"
                                    >
                                        Login
                                    </motion.button>
                                </Link>
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-black transition-colors shadow-lg"
                                    >
                                        Register
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden mt-4 space-y-3 border-t border-white/20 pt-4 overflow-hidden"
                        >
                            <MobileNavLink href="/" icon={<FiHome />}>
                                Matches
                            </MobileNavLink>
                            <MobileNavLink href="/leaderboard" icon={<FiTrendingUp />}>
                                Leaderboard
                            </MobileNavLink>

                            {user ? (
                                <>
                                    {user.isAdmin && (
                                        <MobileNavLink href="/admin" icon={<FiSettings />}>
                                            Admin ★
                                        </MobileNavLink>
                                    )}
                                    <MobileNavLink href="/predictions" icon={<FiTarget />}>
                                        My Predictions
                                    </MobileNavLink>
                                    <div className="pt-2 space-y-2">
                                        <div className="flex items-center gap-2 text-sm bg-white/20 px-4 py-2 rounded-lg">
                                            <FiUser className="w-4 h-4" />
                                            <span className="font-bold">{user.username}</span>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-left flex items-center gap-2"
                                        >
                                            <FiLogOut className="w-4 h-4" />
                                            Logout
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 hover:bg-white/20 rounded-lg font-bold"
                                        >
                                            Login
                                        </motion.div>
                                    </Link>
                                    <Link href="/register" className="block">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-center"
                                        >
                                            Register
                                        </motion.div>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    );
}

// Desktop Nav Link Component
function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 font-bold hover:text-yellow-300 transition-colors cursor-pointer"
            >
                {icon}
                {children}
            </motion.div>
        </Link>
    );
}

// Mobile Nav Link Component
function MobileNavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link href={href}>
            <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg font-bold transition-colors"
            >
                {icon}
                {children}
            </motion.div>
        </Link>
    );
}
