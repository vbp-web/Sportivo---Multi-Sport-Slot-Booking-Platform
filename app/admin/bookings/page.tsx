'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Badge from '@/components/ui/Badge';

interface Booking {
    _id: string;
    bookingCode: string;
    userId: {
        name: string;
        phone: string;
        email?: string;
    };
    slotId: {
        date: string;
        startTime: string;
        endTime: string;
    };
    slots?: Array<{
        date: string;
        startTime: string;
        endTime: string;
    }>;
    venueId: {
        name: string;
        city: string;
        address: string;
    };
    courtId: {
        name: string;
    };
    sportId: {
        name: string;
    };
    amount: number;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    paymentProof?: string;
    utr?: string;
    rejectionReason?: string;
    createdAt: string;
}

export default function AdminBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'>('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentProof, setShowPaymentProof] = useState(false);
    const [selectedProof, setSelectedProof] = useState('');

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

        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { variant: 'warning' as const, label: 'Pending' },
            confirmed: { variant: 'success' as const, label: 'Confirmed' },
            rejected: { variant: 'danger' as const, label: 'Rejected' },
            cancelled: { variant: 'default' as const, label: 'Cancelled' },
            completed: { variant: 'success' as const, label: 'Completed' },
        };
        return config[status as keyof typeof config] || config.pending;
    };

    const formatSlotTime = (slot: any) => {
        if (!slot) return 'N/A';
        const date = new Date(slot.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        return `${date} | ${slot.startTime} - ${slot.endTime}`;
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const searchPath = searchTerm.toLowerCase();

        const matchesSearch =
            (booking.bookingCode?.toLowerCase() || '').includes(searchPath) ||
            (booking.userId?.name?.toLowerCase() || '').includes(searchPath) ||
            (booking.venueId?.name?.toLowerCase() || '').includes(searchPath) ||
            (booking.utr?.toLowerCase() || '').includes(searchPath);

        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading all bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar role="admin" />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                        <p className="text-gray-600 mt-2">Monitor all bookings across the platform</p>
                    </div>
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                        {['all', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${filter === tab
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 w-full">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by code, user, venue or UTR..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue/Sport</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Slots</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-lg font-medium">No bookings found</p>
                                                <p className="text-sm">Try adjusting your filters or search terms</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{booking.bookingCode}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{booking.userId?.name || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500">{booking.userId?.phone || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{booking.venueId?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">
                                                    {booking.sportId?.name || 'N/A'} | {booking.courtId?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-900 space-y-0.5">
                                                    {booking.slots && booking.slots.length > 0 ? (
                                                        booking.slots.slice(0, 2).map((slot, idx) => (
                                                            <div key={idx}>{formatSlotTime(slot)}</div>
                                                        ))
                                                    ) : (
                                                        <div>{formatSlotTime(booking.slotId)}</div>
                                                    )}
                                                    {booking.slots && booking.slots.length > 2 && (
                                                        <div className="text-blue-600 font-medium">+{booking.slots.length - 2} more</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">₹{booking.amount}</div>
                                                {booking.utr && (
                                                    <div className="text-[10px] text-gray-500 mt-1 uppercase">UTR: {booking.utr}</div>
                                                )}
                                                {booking.paymentProof && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProof(`http://localhost:5000${booking.paymentProof}`);
                                                            setShowPaymentProof(true);
                                                        }}
                                                        className="text-[10px] text-blue-600 hover:underline mt-0.5 block"
                                                    >
                                                        View Proof
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusBadge(booking.status).variant}>
                                                    {getStatusBadge(booking.status).label}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Payment Proof Modal */}
            {showPaymentProof && selectedProof && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowPaymentProof(false)}
                >
                    <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
                        <button
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            onClick={() => setShowPaymentProof(false)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="p-2">
                            <img
                                src={selectedProof}
                                alt="Payment Proof"
                                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('http://localhost:5000/uploads/')) {
                                        // Attempt to fix double slash or path issue
                                        // target.src = target.src.replace('/uploads/', '/uploads/');
                                    }
                                }}
                            />
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Payment Verification Proof</span>
                            <a
                                href={selectedProof}
                                download
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Download Image
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
