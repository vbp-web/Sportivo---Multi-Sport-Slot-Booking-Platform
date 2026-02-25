'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { getApiUrl } from '@/lib/api-config';

interface AnalyticsData {
    overview: {
        totalRevenue: number;
        totalBookings: number;
        totalVenues: number;
        totalOwners: number;
        activeUsers: number;
        pendingApprovals: number;
    };
    recentActivity: Array<{
        id: string;
        type: 'booking' | 'owner' | 'payment' | 'venue';
        message: string;
        timestamp: string;
    }>;
    topVenues: Array<{
        id: string;
        name: string;
        city: string;
        bookings: number;
        revenue: number;
    }>;
    monthlyStats: Array<{
        month: string;
        revenue: number;
        bookings: number;
    }>;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(getApiUrl('admin/analytics'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data.data);
            } else {
                setError('Failed to fetch analytics data');
            }
        } catch (err: unknown) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

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

    if (error || !analyticsData) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar role="admin" />
                <main className="flex-1 p-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error || 'No data available'}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar role="admin" />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Platform overview and analytics</p>
                </div>

                <AnalyticsDashboard data={analyticsData} />
            </main>
        </div>
    );
}
