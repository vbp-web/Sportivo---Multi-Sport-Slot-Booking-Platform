'use client';

import { useState, useEffect, use, useCallback } from 'react';
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

export default function EditCourtPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const courtId = resolvedParams.id;
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
        capacity: '',
        description: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch cities and sports (for dropdowns)
            const [venuesRes, sportsRes, courtRes] = await Promise.all([
                fetch(getApiUrl('owner/venues'), { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(getApiUrl('sports')),
                fetch(getApiUrl(`owner/courts/${courtId}`), { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (venuesRes.ok) {
                const venuesData = await venuesRes.json();
                setVenues(venuesData.data || []);
            }

            if (sportsRes.ok) {
                const sportsData = await sportsRes.json();
                setSports(sportsData.data || []);
            }

            if (courtRes.ok) {
                const courtData = await courtRes.json();
                const court = courtData.data;
                setFormData({
                    name: court.name,
                    venueId: typeof court.venueId === 'object' ? court.venueId._id : court.venueId,
                    sportId: typeof court.sportId === 'object' ? court.sportId._id : court.sportId,
                    pricePerHour: court.price.toString(),
                    capacity: court.capacity?.toString() || '',
                    description: court.description || ''
                });
            } else {
                alert('Failed to fetch court details');
                router.push('/owner/courts');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [courtId, router]);

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
            const response = await fetch(getApiUrl(`owner/courts/${courtId}`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    venueId: formData.venueId,
                    sportId: formData.sportId,
                    price: Number(formData.pricePerHour),
                    capacity: formData.capacity ? Number(formData.capacity) : undefined,
                    description: formData.description
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Court updated successfully!');
                router.push('/owner/courts');
            } else {
                alert(data.message || 'Failed to update court');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update court');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <h1 className="text-4xl font-bold text-gray-900">Edit Court</h1>
                    <p className="text-lg text-gray-600 mt-2">Update yours court details</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Court Name *"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                            placeholder="e.g., Court 1, Main Court"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Venue *
                            </label>
                            <select
                                value={formData.venueId}
                                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Sport *
                            </label>
                            <select
                                value={formData.sportId}
                                onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Price Per Hour (₹) *"
                                type="number"
                                value={formData.pricePerHour}
                                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                                error={errors.pricePerHour}
                                placeholder="e.g., 500"
                            />
                            <Input
                                label="Capacity (Optional)"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="e.g., 10"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                rows={3}
                                placeholder="Any additional details..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1">
                                {submitting ? 'Updating Court...' : 'Update Court'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
