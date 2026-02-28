'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getApiUrl } from '@/lib/api-config';

interface Venue {
    _id: string;
    name: string;
    city: string;
}

interface Sport {
    _id: string;
    name: string;
}

export default function AddCourtPage() {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        venueId: '',
        sportId: '',
        pricePerHour: '',
        description: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch owner's venues
            const venuesRes = await fetch(getApiUrl('owner/venues'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (venuesRes.ok) {
                const venuesData = await venuesRes.json();
                setVenues(venuesData.data || []);
            }

            // Fetch sports
            const sportsRes = await fetch(getApiUrl('sports'));
            if (sportsRes.ok) {
                const sportsData = await sportsRes.json();
                setSports(sportsData.data || []);
            }
        } catch (err: unknown) {
            console.error('Error fetching data:', err);
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

        fetchData();
    }, [fetchData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Court name is required';
        if (!formData.venueId) newErrors.venueId = 'Please select a venue';
        if (!formData.sportId) newErrors.sportId = 'Please select a sport';
        if (!formData.pricePerHour) newErrors.pricePerHour = 'Price is required';
        else if (isNaN(Number(formData.pricePerHour)) || Number(formData.pricePerHour) <= 0) {
            newErrors.pricePerHour = 'Enter a valid price';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/courts'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    venueId: formData.venueId,
                    sportId: formData.sportId,
                    pricePerHour: Number(formData.pricePerHour),
                    description: formData.description
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Court added successfully!');
                router.push('/owner/courts');
            } else {
                alert(data.message || 'Failed to add court');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to add court');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (venues.length === 0) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-gray-900/60 rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-white">No venues found</h3>
                        <p className="mt-1 text-sm text-gray-500">You need to add a venue first before adding courts.</p>
                        <div className="mt-6">
                            <Button onClick={() => router.push('/owner/venues/add')}>
                                Add Venue First
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Courts
                    </button>
                    <h1 className="text-4xl font-bold text-white">Add New Court</h1>
                    <p className="text-lg text-gray-400 mt-2">Add a court to your venue</p>
                </div>

                <div className="bg-gray-900/60 rounded-lg shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Court Name *"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                            placeholder="e.g., Court 1, Main Court, Indoor Court"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Select Venue *
                            </label>
                            <select
                                value={formData.venueId}
                                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-white/[0.08] focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Choose a venue</option>
                                {venues.map(venue => (
                                    <option key={venue._id} value={venue._id}>
                                        {venue.name} - {venue.city}
                                    </option>
                                ))}
                            </select>
                            {errors.venueId && <p className="mt-1 text-sm text-red-600">{errors.venueId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Select Sport *
                            </label>
                            <select
                                value={formData.sportId}
                                onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-white/[0.08] focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Choose a sport</option>
                                {sports.map(sport => (
                                    <option key={sport._id} value={sport._id}>
                                        {sport.name}
                                    </option>
                                ))}
                            </select>
                            {errors.sportId && <p className="mt-1 text-sm text-red-600">{errors.sportId}</p>}
                        </div>

                        <Input
                            label="Price Per Hour (₹) *"
                            type="number"
                            value={formData.pricePerHour}
                            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                            error={errors.pricePerHour}
                            placeholder="e.g., 500"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-white/[0.08] focus:border-blue-500 focus:outline-none"
                                rows={3}
                                placeholder="Any additional details about this court..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1">
                                {submitting ? 'Adding Court...' : 'Add Court'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
