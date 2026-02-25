'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Sidebar from '@/components/shared/Sidebar';
import BookingCard from '@/components/user/BookingCard';
import { getApiUrl } from '@/lib/api-config';

interface User {
    name: string;
    phone: string;
    email?: string;
    role: string;
}

interface Booking {
    _id: string;
    bookingCode: string;
    venueId: {
        name: string;
    };
    sportId: {
        name: string;
    };
    courtId: {
        name: string;
    };
    slotId: {
        date: string;
        startTime: string;
        endTime: string;
    };
    amount: number;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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
            setUser(JSON.parse(userData));
        }

        fetchBookings();
    }, [fetchBookings, router]);

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('user/profile'), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email })
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
                localStorage.setItem('user', JSON.stringify(data.data));
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar role={(user?.role as 'user' | 'admin' | 'owner') || 'user'} />

                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'bookings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                My Bookings ({bookings.length})
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {activeTab === 'profile' ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={user?.name}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        defaultValue={user?.phone}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 bg-gray-50"
                                        disabled
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={user?.email || ''}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.role.toUpperCase()}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 bg-gray-50 capitalize"
                                        disabled
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? 'Updating...' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            {bookings.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                                    <p className="text-gray-500 mb-6">You haven&apos;t made any bookings yet. Start by browsing available venues!</p>
                                    <button
                                        onClick={() => router.push('/cities')}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
                                    >
                                        Browse Venues
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {bookings.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={{
                                                id: booking._id,
                                                bookingCode: booking.bookingCode,
                                                venueName: typeof booking.venueId === 'object' ? booking.venueId.name : 'N/A',
                                                sportName: typeof booking.sportId === 'object' ? booking.sportId.name : 'N/A',
                                                courtName: typeof booking.courtId === 'object' ? booking.courtId.name : 'N/A',
                                                date: typeof booking.slotId === 'object' ? booking.slotId.date : '',
                                                startTime: typeof booking.slotId === 'object' ? booking.slotId.startTime : '',
                                                endTime: typeof booking.slotId === 'object' ? booking.slotId.endTime : '',
                                                amount: booking.amount,
                                                status: booking.status,
                                                createdAt: booking.createdAt
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
