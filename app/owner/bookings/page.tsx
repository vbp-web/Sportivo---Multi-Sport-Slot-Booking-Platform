'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Badge from '@/components/ui/Badge';
import { getApiUrl } from '@/lib/api-config';

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
    };
    courtId: {
        name: string;
    };
    sportId: {
        name: string;
    };
    amount: number;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
    paymentProof?: string;
    utr?: string;
    rejectionReason?: string;
    createdAt: string;
    confirmedAt?: string;
}

export default function OwnerBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('pending');
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showPaymentProof, setShowPaymentProof] = useState(false);
    const [selectedProof, setSelectedProof] = useState('');

    const fetchBookings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/bookings'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                let bookingsData = data.data || [];

                // Filter by status
                if (filter !== 'all') {
                    bookingsData = bookingsData.filter((b: Booking) => b.status === filter);
                }

                setBookings(bookingsData);
            }
        } catch (err: unknown) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchBookings();

        // Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchBookings, 30000);
        return () => clearInterval(interval);
    }, [fetchBookings, router]);

    const handleApprove = async (bookingId: string) => {
        if (!confirm('Are you sure you want to approve this booking?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`owner/bookings/${bookingId}/approve`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Booking approved successfully!');
                fetchBookings();
            } else {
                alert(data.message || 'Failed to approve booking');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to approve booking');
        }
    };

    const handleReject = async () => {
        if (!selectedBooking) return;
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`owner/bookings/${selectedBooking._id}/reject`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Booking rejected successfully!');
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedBooking(null);
                fetchBookings();
            } else {
                alert(data.message || 'Failed to reject booking');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to reject booking');
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { variant: 'warning' as const, label: 'Pending' },
            confirmed: { variant: 'success' as const, label: 'Confirmed' },
            rejected: { variant: 'danger' as const, label: 'Rejected' },
            cancelled: { variant: 'default' as const, label: 'Cancelled' },
        };
        return config[status as keyof typeof config] || config.pending;
    };

    const formatSlotTime = (slot: { date: string; startTime: string; endTime: string }) => {
        if (!slot) return 'N/A';
        const date = new Date(slot.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        return `${date} | ${slot.startTime} - ${slot.endTime}`;
    };

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Bookings
                        </h1>
                        <p className="text-lg text-gray-600">
                            Manage and approve booking requests
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
                        Refresh Now
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        {(['all', 'pending', 'confirmed', 'rejected', 'cancelled'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${filter === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No {filter} bookings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'pending' ? 'No pending bookings at the moment.' : `No ${filter} bookings found.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.bookingCode}
                                            </h3>
                                            <Badge variant={getStatusBadge(booking.status).variant}>
                                                {getStatusBadge(booking.status).label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Booked on: {new Date(booking.createdAt).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">₹{booking.amount}</div>
                                        {booking.utr && (
                                            <div className="text-xs text-gray-500 mt-1">UTR: {booking.utr}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Details</h4>
                                        <p className="text-sm text-gray-900">{booking.userId.name}</p>
                                        <p className="text-sm text-gray-600">{booking.userId.phone}</p>
                                        {booking.userId.email && (
                                            <p className="text-sm text-gray-600">{booking.userId.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Details</h4>
                                        <p className="text-sm text-gray-900">
                                            {typeof booking.venueId === 'object' ? booking.venueId.name : 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {typeof booking.courtId === 'object' ? booking.courtId.name : 'N/A'} - {typeof booking.sportId === 'object' ? booking.sportId.name : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Time Slot(s)</h4>
                                    {booking.slots && booking.slots.length > 0 ? (
                                        <div className="space-y-1">
                                            {booking.slots.map((slot, idx) => (
                                                <p key={idx} className="text-sm text-gray-900">
                                                    {formatSlotTime(slot)}
                                                </p>
                                            ))}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {booking.slots.length} slot(s) booked
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-900">
                                            {formatSlotTime(booking.slotId)}
                                        </p>
                                    )}
                                </div>

                                {booking.paymentProof && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => {
                                                setSelectedProof(booking.paymentProof || '');
                                                setShowPaymentProof(true);
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Payment Proof
                                        </button>
                                    </div>
                                )}

                                {booking.status === 'rejected' && booking.rejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-800">
                                            <strong>Rejection Reason:</strong> {booking.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {booking.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleApprove(booking._id)}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve Booking
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setShowRejectModal(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Reject Modal */}
            {showRejectModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Reject Booking
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Booking Code: <strong>{selectedBooking.bookingCode}</strong>
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-500 focus:outline-none"
                                rows={4}
                                placeholder="Please provide a reason for rejection..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                disabled={!rejectionReason.trim()}
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedBooking(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof Modal */}
            {showPaymentProof && selectedProof && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPaymentProof(false)}>
                    <div className="max-w-4xl max-h-[90vh] overflow-auto relative">
                        <Image
                            src={selectedProof}
                            alt="Payment Proof"
                            width={800}
                            height={1200}
                            className="max-w-full h-auto"
                            unoptimized
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
