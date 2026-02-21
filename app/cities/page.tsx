'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CityCard from '@/components/user/CityCard';
import { getApiUrl } from '@/lib/api-config';

interface City {
    _id: string;
    name: string;
    state: string;
    isActive: boolean;
    venueCount?: number;
}

export default function CitiesPage() {
    const router = useRouter();
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await fetch(getApiUrl('cities'));
            if (response.ok) {
                const data = await response.json();
                setCities(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading cities...</p>
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
                        Select Your City
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose a city to browse available sports venues
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search cities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
                    />
                </div>

                {/* Cities Grid */}
                {filteredCities.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">
                            {searchTerm ? 'No cities found matching your search.' : 'No cities available at the moment.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCities.map((city) => (
                            <CityCard
                                key={city._id}
                                city={{
                                    id: city._id,
                                    name: city.name,
                                    state: city.state,
                                    venueCount: city.venueCount || 0,
                                    isActive: city.isActive
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

