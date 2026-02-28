'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { getApiUrl } from '@/lib/api-config';
import { useCallback } from 'react';

interface Sport {
    _id: string;
    name: string;
    icon?: string;
}

interface Court {
    _id: string;
    name: string;
    description?: string;
    capacity?: number;
    sportId: Sport;
    isActive: boolean;
}

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

export default function VenueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const venueId = resolvedParams.id;

    const [venue, setVenue] = useState<Venue | null>(null);
    const [courts, setCourts] = useState<Court[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSport, setSelectedSport] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            // Fetch venue details
            const venueRes = await fetch(getApiUrl(`venues/${venueId}`));
            if (venueRes.ok) {
                const venueData = await venueRes.json();
                setVenue(venueData.data.venue);
                setCourts(venueData.data.courts || []);
            } else {
                setError('Venue not found');
            }

            // Fetch sports offered
            const sportsRes = await fetch(getApiUrl(`venues/${venueId}/sports`));
            if (sportsRes.ok) {
                const sportsData = await sportsRes.json();
                setSports(sportsData.data || []);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load venue details';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [venueId]);

    useEffect(() => {
        if (venueId) {
            fetchData();
        }
    }, [venueId, fetchData]);

    const filteredCourts = selectedSport === 'all'
        ? courts
        : courts.filter(court => court.sportId._id === selectedSport);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading venue details...</p>
                </div>
            </div>
        );
    }

    if (error || !venue) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                        <p className="text-red-600">{error || 'Venue not found'}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-6"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                {/* Venue Header */}
                <div className="bg-gray-900/60 rounded-lg shadow-md p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{venue.name}</h1>
                            <p className="text-lg text-gray-400">{venue.city}</p>
                        </div>
                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    </div>

                    {venue.description && (
                        <p className="text-gray-300 mb-6">{venue.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-white">Address</p>
                                <p className="text-gray-400">{venue.address}</p>
                                <p className="text-gray-400">{venue.city}, {venue.pincode}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div>
                                <p className="font-medium text-white">Contact</p>
                                <p className="text-gray-400">{venue.phone}</p>
                                {venue.email && <p className="text-gray-400">{venue.email}</p>}
                            </div>
                        </div>
                    </div>

                    {venue.amenities && venue.amenities.length > 0 && (
                        <div>
                            <p className="font-medium text-white mb-3">Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {venue.amenities.map((amenity, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sports Filter */}
                {sports.length > 0 && (
                    <div className="mb-6">
                        <p className="font-medium text-white mb-3">Filter by Sport</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedSport('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSport === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                All Sports
                            </button>
                            {sports.map((sport) => (
                                <button
                                    key={sport._id}
                                    onClick={() => setSelectedSport(sport._id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSport === sport._id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {sport.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Courts */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Available Courts ({filteredCourts.length})
                    </h2>

                    {filteredCourts.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-white">No courts</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {selectedSport === 'all'
                                    ? 'No courts available at this venue.'
                                    : 'No courts available for the selected sport.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourts.map((court) => (
                                <div
                                    key={court._id}
                                    className="bg-gray-900/60 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-white">{court.name}</h3>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {court.sportId.name}
                                        </span>
                                    </div>

                                    {court.description && (
                                        <p className="text-gray-400 text-sm mb-4">{court.description}</p>
                                    )}

                                    {court.capacity && (
                                        <p className="text-gray-400 text-sm mb-4">
                                            <span className="font-medium">Capacity:</span> {court.capacity} players
                                        </p>
                                    )}

                                    <button
                                        onClick={() => router.push(`/venues/${venueId}/courts/${court._id}/slots`)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Book Slots
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
