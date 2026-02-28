'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api-config';

interface Court {
    _id: string;
    name: string;
    venueId: {
        _id: string;
        name: string;
    };
    sportId: {
        _id: string;
        name: string;
    };
    capacity?: number;
    isActive: boolean;
}

interface Subscription {
    planId?: {
        _id?: string;
        name: string;
        maxCourts: number;
    };
}

export default function OwnerCourtsPage() {
    const router = useRouter();
    const [courts, setCourts] = useState<Court[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSubscription = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/subscription'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubscription(data.data);
            }
        } catch (err: unknown) {
            console.error('Error fetching subscription:', err);
        }
    }, []);

    const fetchCourts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(getApiUrl('owner/courts'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courts');
            }

            const data = await response.json();
            setCourts(data.data || []);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courts';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchCourts();
        fetchSubscription();
    }, [fetchCourts, fetchSubscription, router]);

    const handleAddCourt = () => {
        router.push('/owner/courts/add');
    };

    const handleToggleStatus = async (courtId: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`owner/courts/${courtId}`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (response.ok) {
                fetchCourts();
            }
        } catch (err: unknown) {
            console.error('Error toggling court status:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading courts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            My Courts
                        </h1>
                        <p className="text-lg text-gray-400">
                            {subscription ? (
                                <span>
                                    Limit: <span className="font-bold text-blue-600">{subscription.planId?.maxCourts || 0}</span> courts per venue in <span className="font-bold">{subscription.planId?.name}</span> plan
                                </span>
                            ) : (
                                'Manage courts across all your venues'
                            )}
                        </p>
                    </div>
                    <Button onClick={handleAddCourt}>
                        + Add New Court
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {/* Courts List */}
                {courts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-white">No courts</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new court.</p>
                        <div className="mt-6">
                            <Button onClick={handleAddCourt}>
                                + Add New Court
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900/60 rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Court Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Venue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sport
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-900/60 divide-y divide-gray-200">
                                {courts.map((court) => (
                                    <tr key={court._id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{court.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">
                                                {typeof court.venueId === 'object' ? court.venueId.name : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {typeof court.sportId === 'object' ? court.sportId.name : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {court.capacity || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${court.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {court.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => router.push(`/owner/courts/edit/${court._id}`)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(court._id, court.isActive)}
                                                className={`${court.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                                    }`}
                                            >
                                                {court.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
