'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import DashboardStats from '@/components/owner/DashboardStats';
import { getApiUrl } from '@/lib/api-config';

interface Activity {
    id: string;
    type: string;
    message: string;
    details: string;
    timestamp: string;
    amount?: number;
}

interface Stats {
    totalBookings: number;
    pendingBookings: number;
    todayRevenue: number;
    monthlyRevenue: number;
    activeSlots: number;
    totalCourts: number;
    subscription?: {
        planName: string;
        bookingsUsage: number;
        bookingsLimit: string | number;
        messagesUsage: number;
        messagesLimit: string | number;
        daysRemaining: number;
    } | null;
}

export default function OwnerDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const defaultStats: Stats = {
        totalBookings: 0,
        pendingBookings: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        activeSlots: 0,
        totalCourts: 0,
        subscription: null
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(getApiUrl('owner/dashboard'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data.stats);
                setRecentActivity(data.data.recentActivity || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch dashboard data');
            }
        } catch (err: unknown) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-gray-950 flex">
                <Sidebar role="owner" />
                <main className="flex-1 p-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error || 'No data available'}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex">
            <Sidebar role="owner" />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400 mt-2">Welcome back! Here&apos;s your venue overview</p>
                </div>

                <DashboardStats stats={stats || defaultStats} />

                {/* Recent Activity */}
                <div className="mt-8 bg-gray-900/60 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                    {recentActivity.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                                    <div className="text-2xl">
                                        {activity.type === 'pending' ? '📅' : '✅'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{activity.details}</p>
                                        {activity.amount && (
                                            <p className="text-xs text-green-600 font-medium">₹{activity.amount}</p>
                                        )}
                                    </div>
                                    <span className="ml-auto text-xs text-gray-500">
                                        {formatTimeAgo(activity.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
