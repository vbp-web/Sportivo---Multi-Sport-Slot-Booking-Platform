'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SlotCard from '@/components/user/SlotCard';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api-config';

interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    status: 'available' | 'booked' | 'blocked';
}

interface Court {
    _id: string;
    name: string;
    description?: string;
    capacity?: number;
    sportId: {
        _id: string;
        name: string;
    };
}

interface Venue {
    _id: string;
    name: string;
    city: string;
    address: string;
}

export default function CourtSlotsPage({ params }: { params: Promise<{ id: string, courtId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const venueId = resolvedParams.id;
    const courtId = resolvedParams.courtId;

    const [venue, setVenue] = useState<Venue | null>(null);
    const [court, setCourt] = useState<Court | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [multiSelectMode, setMultiSelectMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch venue details
            const venueRes = await fetch(getApiUrl(`venues/${venueId}`));
            if (venueRes.ok) {
                const venueData = await venueRes.json();
                setVenue(venueData.data.venue);
            }

            // Fetch court details
            const courtRes = await fetch(getApiUrl(`courts/${courtId}`));
            if (courtRes.ok) {
                const courtData = await courtRes.json();
                setCourt(courtData.data);
            }

            // Fetch slots for this court
            const slotsUrl = selectedDate
                ? getApiUrl(`slots?courtId=${courtId}&date=${selectedDate}`)
                : getApiUrl(`slots?courtId=${courtId}`);

            const slotsRes = await fetch(slotsUrl);
            if (slotsRes.ok) {
                const slotsData = await slotsRes.json();
                setSlots(slotsData.data || []);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [venueId, courtId, selectedDate]);

    useEffect(() => {
        if (venueId && courtId) {
            fetchData();
        }
    }, [venueId, courtId, fetchData]);

    const handleSelectSlot = (slotId: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(id => id !== slotId)
                : [...prev, slotId]
        );
    };

    const calculateTotal = () => {
        return selectedSlots.reduce((sum, slotId) => {
            const slot = slots.find(s => s._id === slotId);
            return sum + (slot?.price || 0);
        }, 0);
    };

    const handleSingleBook = async (slotId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const slot = slots.find(s => s._id === slotId);
        if (!slot) return;

        // Navigate to payment/confirmation page
        router.push(`/booking/confirm?venueId=${venueId}&courtId=${courtId}&sportId=${court?.sportId._id}&slotId=${slotId}&amount=${slot.price}`);
    };

    const handleBookMultiple = async () => {
        if (selectedSlots.length === 0) {
            alert('Please select at least one slot');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const totalAmount = calculateTotal();
        const slotIds = selectedSlots.join(',');

        // Navigate to payment/confirmation page with multiple slots
        router.push(`/booking/confirm?venueId=${venueId}&courtId=${courtId}&sportId=${court?.sportId._id}&slots=${slotIds}&amount=${totalAmount}`);
    };

    // Generate next 7 days for date filter
    const getNext7Days = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading slots...</p>
                </div>
            </div>
        );
    }

    if (error || !venue || !court) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                        <p className="text-red-600">{error || 'Data not found'}</p>
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
                    Back to Venue
                </button>

                {/* Header */}
                <div className="bg-gray-900/60 rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{court.name}</h1>
                            <p className="text-lg text-gray-400">{venue.name}, {venue.city}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {court.sportId.name}
                                </span>
                                {court.capacity && (
                                    <span className="text-sm text-gray-400">
                                        Capacity: {court.capacity} players
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {court.description && (
                        <p className="mt-4 text-gray-300">{court.description}</p>
                    )}
                </div>

                {/* Date Filter */}
                <div className="mb-6">
                    <p className="font-medium text-white mb-3">Select Date</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedDate('')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedDate === ''
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            All Dates
                        </button>
                        {getNext7Days().map((date) => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedDate === date
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {date}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Booking Mode Toggle */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        Available Slots ({slots.filter(s => s.status === 'available').length})
                    </h2>
                    <Button
                        onClick={() => {
                            setMultiSelectMode(!multiSelectMode);
                            setSelectedSlots([]);
                        }}
                        variant={multiSelectMode ? 'primary' : 'outline'}
                    >
                        {multiSelectMode ? '📋 Multi-Select ON' : '📋 Enable Multi-Select'}
                    </Button>
                </div>

                {/* Selected Slots Summary */}
                {multiSelectMode && selectedSlots.length > 0 && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg font-bold text-white">
                                    {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
                                </p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    Total: ₹{calculateTotal()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setSelectedSlots([])}
                                    variant="outline"
                                >
                                    Clear Selection
                                </Button>
                                <Button onClick={handleBookMultiple}>
                                    Book {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Slots Grid */}
                {slots.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-white">No slots available</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No slots have been created for this court yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slots.map((slot) => (
                            <SlotCard
                                key={slot._id}
                                slot={{
                                    id: slot._id,
                                    date: slot.date,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                    price: slot.price,
                                    status: slot.status,
                                    courtName: court.name,
                                    sportName: court.sportId.name
                                }}
                                multiSelectMode={multiSelectMode}
                                onSelect={handleSelectSlot}
                                isSelected={selectedSlots.includes(slot._id)}
                                onBook={!multiSelectMode ? () => handleSingleBook(slot._id) : undefined}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
