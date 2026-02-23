'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Sidebar from '@/components/shared/Sidebar';
import BookingCard from '@/components/user/BookingCard';
import { getApiUrl } from '@/lib/api-config';

interface Booking {
    _id: string;
    bookingCode: string;
    venueId: {
        name: string;
        city?: string;
    };
    sportId: {
        name: string;
    };
    courtId: {
        name: string;
    };
    slotId?: {
        date: string;
        startTime: string;
        endTime: string;
    };
    slots?: Array<{
        date: string;
        startTime: string;
        endTime: string;
    }>;
    amount: number;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    createdAt: string;
    rejectionReason?: string;
}

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('user');

    const fetchBookings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('user/bookings'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.data || []);
            } else {
                console.error('Failed to fetch bookings');
            }
        } catch (err: unknown) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role || 'user');
        }

        fetchBookings();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchBookings, 30000);
        return () => clearInterval(interval);
    }, [fetchBookings, router]);

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar role={userRole as 'user' | 'owner' | 'admin'} />

                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    My Bookings
                                </h1>
                                <p className="text-lg text-gray-600">
                                    View and manage all your slot bookings
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    🔄 Auto-refreshes every 30 seconds
                                </p>
                            </div>
                            <button
                                onClick={fetchBookings}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="text-sm text-gray-600">Total Bookings</div>
                                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
                                <div className="text-sm text-yellow-700">Pending</div>
                                <div className="text-2xl font-bold text-yellow-900">
                                    {bookings.filter(b => b.status === 'pending').length}
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg shadow-sm p-4">
                                <div className="text-sm text-green-700">Confirmed</div>
                                <div className="text-2xl font-bold text-green-900">
                                    {bookings.filter(b => b.status === 'confirmed').length}
                                </div>
                            </div>
                            <div className="bg-red-50 rounded-lg shadow-sm p-4">
                                <div className="text-sm text-red-700">Rejected</div>
                                <div className="text-2xl font-bold text-red-900">
                                    {bookings.filter(b => b.status === 'rejected').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <div className="flex gap-4">
                            {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab as typeof filter)}
                                    className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${filter === tab
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {tab}
                                    {tab !== 'all' && (
                                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                                            {bookings.filter(b => b.status === tab).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No {filter !== 'all' ? filter : ''} bookings
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filter === 'all'
                                    ? "You haven&apos;t made any bookings yet. Start by browsing available venues!"
                                    : `No ${filter} bookings found.`}
                            </p>
                            {filter === 'all' && (
                                <button
                                    onClick={() => router.push('/cities')}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
                                >
                                    Browse Venues
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={{
                                        id: booking._id,
                                        bookingCode: booking.bookingCode,
                                        venueName: typeof booking.venueId === 'object' ? booking.venueId.name : 'N/A',
                                        sportName: typeof booking.sportId === 'object' ? booking.sportId.name : 'N/A',
                                        courtName: typeof booking.courtId === 'object' ? booking.courtId.name : 'N/A',
                                        date: booking.slotId?.date || (booking.slots && booking.slots[0]?.date) || '',
                                        startTime: booking.slotId?.startTime || (booking.slots && booking.slots[0]?.startTime) || '',
                                        endTime: booking.slotId?.endTime || (booking.slots && booking.slots[0]?.endTime) || '',
                                        amount: booking.amount,
                                        status: booking.status,
                                        createdAt: booking.createdAt
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
