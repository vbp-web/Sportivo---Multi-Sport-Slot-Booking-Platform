'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getApiUrl } from '@/lib/api-config';

interface Owner {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email?: string;
        phone: string;
    };
    ownerName: string;
    venueName: string;
    city: string;
    sportsOffered: string[];
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    rejectionReason?: string;
    createdAt: string;
    approvedAt?: string;
}

export default function AdminOwnersPage() {
    const router = useRouter();
    const [owners, setOwners] = useState<Owner[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchOwners = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = filter === 'pending'
                ? getApiUrl('admin/owners/pending')
                : getApiUrl('admin/owners');

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                let ownersData = data.data || [];

                // Filter on frontend if not pending
                if (filter !== 'pending' && filter !== 'all') {
                    ownersData = ownersData.filter((o: Owner) => o.status === filter);
                }

                setOwners(ownersData);
            }
        } catch (err: unknown) {
            console.error('Error fetching owners:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

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

        fetchOwners();
    }, [fetchOwners, router]);

    const handleApprove = async (ownerId: string) => {
        if (!confirm('Are you sure you want to approve this owner?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/owners/${ownerId}/approve`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchOwners();
            } else {
                alert(data.message || 'Failed to approve owner');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to approve owner');
        }
    };

    const handleReject = async () => {
        if (!selectedOwner) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/owners/${selectedOwner._id}/reject`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectionReason })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedOwner(null);
                fetchOwners();
            } else {
                alert(data.message || 'Failed to reject owner');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to reject owner');
        }
    };

    const handleSuspend = async (ownerId: string) => {
        if (!confirm('Are you sure you want to suspend this owner?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/owners/${ownerId}/suspend`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchOwners();
            } else {
                alert(data.message || 'Failed to suspend owner');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to suspend owner');
        }
    };

    const handleActivate = async (ownerId: string) => {
        if (!confirm('Are you sure you want to activate this owner?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/owners/${ownerId}/activate`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchOwners();
            } else {
                alert(data.message || 'Failed to activate owner');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to activate owner');
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { variant: 'warning' as const, label: 'Pending' },
            approved: { variant: 'success' as const, label: 'Approved' },
            rejected: { variant: 'danger' as const, label: 'Rejected' },
            suspended: { variant: 'default' as const, label: 'Suspended' },
        };
        return config[status as keyof typeof config] || config.pending;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading owners...</p>
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
                        Owner Management
                    </h1>
                    <p className="text-lg text-gray-600">
                        Review and approve owner registration requests
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex gap-4">
                        {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((tab) => (
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

                {/* Owners List */}
                {owners.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No {filter} owners</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'pending' ? 'No pending owner requests at the moment.' : `No ${filter} owners found.`}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Owner Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Venue Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {owners.map((owner) => (
                                        <tr key={owner._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{owner.ownerName}</div>
                                                <div className="text-sm text-gray-500">
                                                    Registered: {new Date(owner.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{owner.venueName}</div>
                                                <div className="text-sm text-gray-500">{owner.city}</div>
                                                {owner.sportsOffered && owner.sportsOffered.length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Sports: {owner.sportsOffered.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{owner.userId.phone}</div>
                                                {owner.userId.email && (
                                                    <div className="text-sm text-gray-500">{owner.userId.email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusBadge(owner.status).variant}>
                                                    {getStatusBadge(owner.status).label}
                                                </Badge>
                                                {owner.status === 'rejected' && owner.rejectionReason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Reason: {owner.rejectionReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {owner.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(owner._id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOwner(owner);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {owner.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleSuspend(owner._id)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {owner.status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleActivate(owner._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Reject Modal */}
            {showRejectModal && selectedOwner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Reject Owner Request
                        </h2>
                        <p className="text-gray-600 mb-4">
                            You are about to reject <strong>{selectedOwner.ownerName}</strong>&apos;s request.
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
                            <Button
                                onClick={handleReject}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                disabled={!rejectionReason.trim()}
                            >
                                Reject
                            </Button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                    setSelectedOwner(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
