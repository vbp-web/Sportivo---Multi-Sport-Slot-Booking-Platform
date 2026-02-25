'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api-config';

interface Owner {
    _id: string;
    ownerName: string;
    venueName: string;
    city: string;
}

interface Plan {
    _id: string;
    name: string;
    price: number;
    duration?: number;
}

interface Subscription {
    _id: string;
    ownerId: Owner;
    planId: Plan;
    amount: number;
    paymentProof?: string;
    utr?: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export default function AdminSubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'expired'>('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchSubscriptions = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            let path = 'admin/subscriptions';
            if (filter === 'pending') {
                path = 'admin/subscriptions/pending';
            } else if (filter !== 'all') {
                path = `admin/subscriptions?status=${filter}`;
            }

            const response = await fetch(getApiUrl(path), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.data || []);
            } else {
                setError('Failed to fetch subscriptions');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [filter, router]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this subscription?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/subscriptions/${id}/approve`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Subscription approved successfully!');
                fetchSubscriptions();
                setShowModal(false);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve subscription');
            }
        } catch (err) {
            console.error('Error approving subscription:', err);
            alert('Failed to approve subscription');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this subscription? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/subscriptions/${id}/reject`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Payment verification failed' })
            });

            if (response.ok) {
                alert('Subscription rejected successfully!');
                fetchSubscriptions();
                setShowModal(false);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to reject subscription');
            }
        } catch (err) {
            console.error('Error rejecting subscription:', err);
            alert('Failed to reject subscription');
        }
    };

    const viewDetails = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading subscriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Subscription Payments
                    </h1>
                    <p className="text-lg text-gray-600">
                        Manage and approve owner subscription payments
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('expired')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'expired'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Expired
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        All
                    </button>
                </div>

                {/* Subscriptions List */}
                {subscriptions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No subscriptions found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        UTR
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscriptions.map((subscription) => (
                                    <tr key={subscription._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {subscription.ownerId?.ownerName || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {subscription.ownerId?.venueName || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {subscription.ownerId?.city || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {subscription.planId?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ₹{subscription.amount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {subscription.utr || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : subscription.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {subscription.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(subscription.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => viewDetails(subscription)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                View
                                            </button>
                                            {subscription.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(subscription._id)}
                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(subscription._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Modal for viewing details */}
            {showModal && selectedSubscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Owner Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Owner Information</h3>
                                    <p className="text-sm text-gray-600">Name: {selectedSubscription.ownerId?.ownerName}</p>
                                    <p className="text-sm text-gray-600">Venue: {selectedSubscription.ownerId?.venueName}</p>
                                    <p className="text-sm text-gray-600">City: {selectedSubscription.ownerId?.city}</p>
                                </div>

                                {/* Plan Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Plan Information</h3>
                                    <p className="text-sm text-gray-600">Plan: {selectedSubscription.planId?.name}</p>
                                    <p className="text-sm text-gray-600">Amount: ₹{selectedSubscription.amount}</p>
                                    <p className="text-sm text-gray-600">
                                        Period: {new Date(selectedSubscription.startDate).toLocaleDateString()} - {new Date(selectedSubscription.endDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                                    <p className="text-sm text-gray-600">UTR: {selectedSubscription.utr || 'Not provided'}</p>
                                    <p className="text-sm text-gray-600">Status: {selectedSubscription.status.toUpperCase()}</p>
                                    <p className="text-sm text-gray-600">Submitted: {new Date(selectedSubscription.createdAt).toLocaleString()}</p>
                                </div>

                                {/* Payment Proof */}
                                {selectedSubscription.paymentProof && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Payment Proof</h3>
                                        <div className="mt-2">
                                            <Image
                                                src={selectedSubscription.paymentProof.startsWith('http') ? selectedSubscription.paymentProof : getApiUrl(selectedSubscription.paymentProof)}
                                                alt="Payment Proof"
                                                width={400}
                                                height={400}
                                                className="rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedSubscription.status === 'pending' && (
                                <div className="mt-6 flex gap-4">
                                    <Button
                                        onClick={() => handleApprove(selectedSubscription._id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        Approve Subscription
                                    </Button>
                                    <Button
                                        onClick={() => handleReject(selectedSubscription._id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        Reject Payment
                                    </Button>
                                </div>
                            )}

                            <div className="mt-4">
                                <Button
                                    onClick={() => setShowModal(false)}
                                    className="w-full bg-gray-500 hover:bg-gray-600"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
