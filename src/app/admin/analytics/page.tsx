'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { getApiUrl } from '@/lib/api-config';

interface Analytics {
    totalUsers: number;
    totalOwners: number;
    totalVenues: number;
    totalCourts: number;
    totalBookings: number;
    totalRevenue: number;
    pendingOwners: number;
    pendingBookings: number;
    activeCities: number;
    activeSports: number;
}

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = useCallback(async () => {
        try {
            setError('');
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('admin/analytics'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setAnalytics(data.data);
            } else {
                setError(data.message || 'Failed to fetch analytics data');
            }
        } catch (err: unknown) {
            console.error('Error fetching analytics:', err);
            setError('An error occurred while fetching analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchAnalytics();
    }, [fetchAnalytics, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            name: 'Total Users',
            value: analytics?.totalUsers || 0,
            icon: '👥',
            color: 'bg-blue-500',
            link: null
        },
        {
            name: 'Total Owners',
            value: analytics?.totalOwners || 0,
            icon: '🏢',
            color: 'bg-purple-500',
            link: '/admin/owners'
        },
        {
            name: 'Pending Owners',
            value: analytics?.pendingOwners || 0,
            icon: '⏳',
            color: 'bg-yellow-500',
            link: '/admin/owners'
        },
        {
            name: 'Total Venues',
            value: analytics?.totalVenues || 0,
            icon: '🏟️',
            color: 'bg-green-500',
            link: null
        },
        {
            name: 'Total Courts',
            value: analytics?.totalCourts || 0,
            icon: '🎾',
            color: 'bg-indigo-500',
            link: null
        },
        {
            name: 'Total Bookings',
            value: analytics?.totalBookings || 0,
            icon: '📅',
            color: 'bg-pink-500',
            link: null
        },
        {
            name: 'Total Revenue',
            value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`,
            icon: '💰',
            color: 'bg-emerald-500',
            link: null
        },
        {
            name: 'Active Cities',
            value: analytics?.activeCities || 0,
            icon: '🌆',
            color: 'bg-cyan-500',
            link: '/admin/cities'
        },
        {
            name: 'Active Sports',
            value: analytics?.activeSports || 0,
            icon: '⚽',
            color: 'bg-orange-500',
            link: '/admin/sports'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Platform Analytics
                    </h1>
                    <p className="text-lg text-gray-600">
                        Overview of platform statistics and metrics
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${stat.link ? 'cursor-pointer' : ''
                                }`}
                            onClick={() => stat.link && router.push(stat.link)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {stat.name}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => router.push('/admin/owners')}
                            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">👥</div>
                            <div className="font-semibold text-gray-900">Manage Owners</div>
                            <div className="text-sm text-gray-600">Approve or reject owner requests</div>
                        </button>
                        <button
                            onClick={() => router.push('/admin/cities')}
                            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">🌆</div>
                            <div className="font-semibold text-gray-900">Manage Cities</div>
                            <div className="text-sm text-gray-600">Add or remove cities</div>
                        </button>
                        <button
                            onClick={() => router.push('/admin/sports')}
                            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">⚽</div>
                            <div className="font-semibold text-gray-900">Manage Sports</div>
                            <div className="text-sm text-gray-600">Add or remove sports</div>
                        </button>
                        <button
                            onClick={() => router.push('/admin/plans')}
                            className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">📋</div>
                            <div className="font-semibold text-gray-900">Manage Plans</div>
                            <div className="text-sm text-gray-600">Subscription plans</div>
                        </button>
                        <button
                            onClick={() => router.push('/admin/features')}
                            className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-left"
                        >
                            <div className="text-2xl mb-2">✨</div>
                            <div className="font-semibold text-gray-900">Manage Features</div>
                            <div className="text-sm text-gray-600">Plan features</div>
                        </button>
                    </div>
                </div>

                {/* Pending Actions */}
                {(analytics?.pendingOwners || 0) > 0 && (
                    <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    You have <strong>{analytics?.pendingOwners}</strong> pending owner request(s) waiting for approval.
                                    <button
                                        onClick={() => router.push('/admin/owners')}
                                        className="ml-2 font-medium underline hover:text-yellow-800"
                                    >
                                        Review now →
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
