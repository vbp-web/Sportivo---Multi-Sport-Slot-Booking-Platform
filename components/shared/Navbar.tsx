'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';

interface User {
    name: string;
    role: string;
    phone: string;
}

export default function Navbar() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'owner':
                return '/owner/dashboard';
            default:
                return '/profile';
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Sportivo
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Home
                            </Link>
                            <Link href="/cities" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Browse Venues
                            </Link>
                            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                How It Works
                            </Link>
                            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Contact
                            </Link>
                        </div>

                        {/* Desktop Auth/User Section */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-700">{user.name}</span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                                            <Link
                                                href={getDashboardLink()}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>My Profile</span>
                                                </div>
                                            </Link>
                                            {user.role === 'owner' && (
                                                <>
                                                    <Link
                                                        href="/owner/venues"
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            <span>My Venues</span>
                                                        </div>
                                                    </Link>
                                                    <Link
                                                        href="/owner/bookings"
                                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                            <span>Bookings</span>
                                                        </div>
                                                    </Link>
                                                </>
                                            )}
                                            {user.role === 'admin' && (
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>Admin Panel</span>
                                                    </div>
                                                </Link>
                                            )}
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Logout</span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="primary" size="sm">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-4 space-y-3">
                            <Link
                                href="/"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/cities"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Browse Venues
                            </Link>
                            <Link
                                href="/about"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                How It Works
                            </Link>
                            <Link
                                href="/contact"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Contact
                            </Link>

                            {user ? (
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <div className="px-4 py-2 text-sm font-medium text-gray-900">
                                        {user.name}
                                    </div>
                                    <Link href={getDashboardLink()} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                        My Profile
                                    </Link>
                                    {user.role === 'owner' && (
                                        <>
                                            <Link href="/owner/venues" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                My Venues
                                            </Link>
                                            <Link href="/owner/bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                Bookings
                                            </Link>
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <Link href="/login" className="block">
                                        <Button variant="outline" size="sm" className="w-full">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" className="block">
                                        <Button variant="primary" size="sm" className="w-full">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer to prevent content from being hidden under fixed navbar */}
            <div className="h-16"></div>
        </>
    );
}

