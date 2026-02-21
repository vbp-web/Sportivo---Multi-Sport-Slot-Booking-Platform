'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Sidebar from '@/components/shared/Sidebar';
import { API_BASE_URL } from '@/lib/api-config';

interface AnalyticsData {
    totalBookings: number;
    totalRevenue: number;
    todayRevenue: number;
    monthlyRevenue: number;
    pendingBookings: number;
    confirmedBookings: number;
    rejectedBookings: number;
    cancelledBookings: number;
    totalVenues: number;
    totalCourts: number;
    activeSlots: number;
    recentBookings: any[];
}

export default function OwnerAnalyticsPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchAnalytics();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchAnalytics, 60000);
        return () => clearInterval(interval);
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setError('');
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/owner/dashboard`, {
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
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('An error occurred while fetching analytics');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!analytics) return;

        const csvContent = [
            ['Metric', 'Value'],
            ['Total Bookings', analytics.totalBookings],
            ['Total Revenue', `₹${analytics.totalRevenue}`],
            ['Today Revenue', `₹${analytics.todayRevenue}`],
            ['Monthly Revenue', `₹${analytics.monthlyRevenue}`],
            ['Pending Bookings', analytics.pendingBookings],
            ['Confirmed Bookings', analytics.confirmedBookings],
            ['Rejected Bookings', analytics.rejectedBookings],
            ['Cancelled Bookings', analytics.cancelledBookings],
            ['Total Venues', analytics.totalVenues],
            ['Total Courts', analytics.totalCourts],
            ['Active Slots', analytics.activeSlots],
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadPDF = () => {
        alert('PDF download feature coming soon! For now, you can print this page (Ctrl+P) and save as PDF.');
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar role="owner" />

                <main className="flex-1 p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    📈 Analytics Dashboard
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Real-time insights into your business performance
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    🔄 Auto-refreshes every 60 seconds
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={fetchAnalytics}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                                <button
                                    onClick={downloadCSV}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download CSV
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm opacity-90">Total Revenue</div>
                                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">₹{analytics?.totalRevenue || 0}</div>
                            <div className="text-xs opacity-80 mt-1">All time earnings</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm opacity-90">Monthly Revenue</div>
                                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">₹{analytics?.monthlyRevenue || 0}</div>
                            <div className="text-xs opacity-80 mt-1">This month</div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm opacity-90">Today's Revenue</div>
                                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">₹{analytics?.todayRevenue || 0}</div>
                            <div className="text-xs opacity-80 mt-1">Today's earnings</div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm opacity-90">Total Bookings</div>
                                <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold">{analytics?.totalBookings || 0}</div>
                            <div className="text-xs opacity-80 mt-1">All time bookings</div>
                        </div>
                    </div>

                    {/* Booking Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-sm text-gray-600 mb-1">Pending Bookings</div>
                            <div className="text-2xl font-bold text-yellow-600">{analytics?.pendingBookings || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-sm text-gray-600 mb-1">Confirmed Bookings</div>
                            <div className="text-2xl font-bold text-green-600">{analytics?.confirmedBookings || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-sm text-gray-600 mb-1">Rejected Bookings</div>
                            <div className="text-2xl font-bold text-red-600">{analytics?.rejectedBookings || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-sm text-gray-600 mb-1">Cancelled Bookings</div>
                            <div className="text-2xl font-bold text-gray-600">{analytics?.cancelledBookings || 0}</div>
                        </div>
                    </div>

                    {/* Venue & Court Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                                    🏟️
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Total Venues</div>
                                    <div className="text-2xl font-bold text-gray-900">{analytics?.totalVenues || 0}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                                    🎯
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Total Courts</div>
                                    <div className="text-2xl font-bold text-gray-900">{analytics?.totalCourts || 0}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                                    ⏰
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Active Slots</div>
                                    <div className="text-2xl font-bold text-gray-900">{analytics?.activeSlots || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Summary</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Booking Confirmation Rate</span>
                                    <span className="font-medium">
                                        {analytics?.totalBookings ?
                                            Math.round((analytics.confirmedBookings / analytics.totalBookings) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${analytics?.totalBookings ?
                                                (analytics.confirmedBookings / analytics.totalBookings) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Booking Rejection Rate</span>
                                    <span className="font-medium">
                                        {analytics?.totalBookings ?
                                            Math.round((analytics.rejectedBookings / analytics.totalBookings) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{
                                            width: `${analytics?.totalBookings ?
                                                (analytics.rejectedBookings / analytics.totalBookings) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Average Revenue per Booking</span>
                                    <span className="font-medium">
                                        ₹{analytics?.totalBookings ?
                                            Math.round(analytics.totalRevenue / analytics.totalBookings) : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
