'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import VenueCard from '@/components/user/VenueCard';
import { getApiUrl } from '@/lib/api-config';

interface Venue {
    _id: string;
    name: string;
    city: string;
    address: string;
    sports?: string[];
    rating?: number;
    images?: string[];
    isActive: boolean;
}

function VenuesContent() {
    const searchParams = useSearchParams();
    const cityParam = searchParams.get('city');

    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSport, setSelectedSport] = useState('All Sports');
    const [city] = useState(cityParam || 'All Cities');

    const fetchVenues = useCallback(async () => {
        try {
            let url = getApiUrl('venues');
            if (city && city !== 'All Cities') {
                url += `?city=${encodeURIComponent(city)}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setVenues(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setLoading(false);
        }
    }, [city]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    const filteredVenues = venues.filter(venue => {
        const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSport = selectedSport === 'All Sports' ||
            (venue.sports && venue.sports.includes(selectedSport));
        return matchesSearch && matchesSport;
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Venues {city && city !== 'All Cities' ? `in ${city}` : ''}
                    </h1>
                    <p className="text-lg text-gray-600">
                        Browse and book sports venues near you
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-wrap gap-4">
                    <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    >
                        <option>All Sports</option>
                        <option>Cricket</option>
                        <option>Football</option>
                        <option>Badminton</option>
                        <option>Tennis</option>
                        <option>Basketball</option>
                        <option>Volleyball</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search venues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 max-w-md px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Venues Grid */}
                {filteredVenues.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">
                            {searchTerm || selectedSport !== 'All Sports'
                                ? 'No venues found matching your filters.'
                                : 'No venues available at the moment.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVenues.map((venue) => (
                            <VenueCard
                                key={venue._id}
                                venue={{
                                    id: venue._id,
                                    name: venue.name,
                                    city: venue.city,
                                    address: venue.address,
                                    sports: venue.sports || [],
                                    rating: venue.rating || 0,
                                    images: venue.images || [],
                                    isActive: venue.isActive
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function VenuesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Preparing venues...</p>
                </div>
            </div>
        }>
            <VenuesContent />
        </Suspense>
    );
}
