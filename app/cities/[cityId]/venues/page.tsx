'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { getApiUrl } from '@/lib/api-config';

interface Venue {
    _id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    pincode: string;
    phone: string;
    email?: string;
    amenities?: string[];
    isActive: boolean;
}

interface City {
    _id: string;
    name: string;
    state: string;
}

export default function CityVenuesPage({ params }: { params: Promise<{ cityId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const cityId = resolvedParams.cityId;

    const [city, setCity] = useState<City | null>(null);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            // Fetch city details
            const cityRes = await fetch(getApiUrl(`cities/${cityId}`));
            if (cityRes.ok) {
                const cityData = await cityRes.json();
                setCity(cityData.data);

                // Fetch venues for this city
                const venuesRes = await fetch(getApiUrl(`venues/city/${cityData.data.name}`));
                if (venuesRes.ok) {
                    const venuesData = await venuesRes.json();
                    setVenues(venuesData.data || []);
                }
            } else {
                setError('City not found');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load data';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [cityId]);

    useEffect(() => {
        if (cityId) {
            fetchData();
        }
    }, [cityId, fetchData]);

    const handleVenueClick = (venueId: string) => {
        router.push(`/venues/${venueId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading venues...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => router.push('/cities')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Back to Cities
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/cities')}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Cities
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Venues in {city?.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {city?.state} • {venues.length} venue{venues.length !== 1 ? 's' : ''} available
                    </p>
                </div>

                {/* Venues List */}
                {venues.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No venues</h3>
                        <p className="mt-1 text-sm text-gray-500">No venues available in this city yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {venues.map((venue) => (
                            <div
                                key={venue._id}
                                onClick={() => handleVenueClick(venue._id)}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">{venue.name}</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>

                                {venue.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {venue.description}
                                    </p>
                                )}

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {venue.address}
                                    </p>
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {venue.phone}
                                    </p>
                                </div>

                                {venue.amenities && venue.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {venue.amenities.slice(0, 3).map((amenity, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                        {venue.amenities.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{venue.amenities.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
