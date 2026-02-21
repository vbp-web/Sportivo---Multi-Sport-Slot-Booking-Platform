'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getApiUrl } from '@/lib/api-config';

interface Slot {
    _id: string;
    courtId: {
        _id: string;
        name: string;
        venueId: {
            _id: string;
            name: string;
        };
        sportId: {
            _id?: string;
            name: string;
        };
    };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    status: 'available' | 'booked' | 'blocked';
}

interface Court {
    _id: string;
    name: string;
    venueId: {
        _id: string;
        name: string;
    };
    sportId: {
        name: string;
    };
    pricePerHour: number;
}

export default function OwnerSlotsPage() {
    const router = useRouter();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterCourt, setFilterCourt] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked' | 'blocked'>('all');

    // Offline booking states
    const [showOfflineBookingModal, setShowOfflineBookingModal] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch courts
            const courtsRes = await fetch(getApiUrl('owner/courts'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (courtsRes.ok) {
                const courtsData = await courtsRes.json();
                setCourts(courtsData.data || []);
            }

            // Fetch slots
            const slotsRes = await fetch(getApiUrl('owner/slots'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (slotsRes.ok) {
                const slotsData = await slotsRes.json();
                setSlots(slotsData.data || []);
            }
        } catch (err: unknown) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchData();
    }, [router, fetchData]);

    const handleCreateSlots = async () => {
        if (!selectedCourt || !selectedDate) {
            alert('Please select court and date');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/slots/generate'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courtId: selectedCourt,
                    date: selectedDate
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Successfully created ${data.count || 0} slots!`);
                setShowCreateModal(false);
                setSelectedCourt('');
                setSelectedDate(new Date().toISOString().split('T')[0]);
                fetchData();
            } else {
                alert(data.message || 'Failed to create slots');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to create slots');
        }
    };

    const handleToggleBlock = async (slotId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'available' : 'blocked';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`owner/slots/${slotId}`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                fetchData();
            } else {
                alert(data.message || 'Failed to update slot');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to update slot');
        }
    };

    const handleOfflineBooking = async () => {
        if (selectedSlots.length === 0) {
            alert('Please select at least one slot');
            return;
        }

        if (!customerName.trim() || !customerPhone.trim()) {
            alert('Please enter customer name and phone number');
            return;
        }

        // Validate phone number (basic validation)
        if (customerPhone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Get details from the first selected slot
            const firstSlot = slots.find(s => s._id === selectedSlots[0]);
            if (!firstSlot) {
                alert('Selected slot not found');
                return;
            }

            // Calculate total amount
            const totalAmount = selectedSlots.reduce((sum, slotId) => {
                const slot = slots.find(s => s._id === slotId);
                return sum + (slot?.price || 0);
            }, 0);

            const response = await fetch(getApiUrl('owner/bookings/offline'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    slotIds: selectedSlots,
                    customerName: customerName.trim(),
                    customerPhone: customerPhone.trim(),
                    venueId: firstSlot.courtId.venueId._id,
                    courtId: firstSlot.courtId._id,
                    sportId: firstSlot.courtId.sportId,
                    amount: totalAmount
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ Offline booking created successfully!\nBooking Code: ${data.data?.bookingCode || 'N/A'}\nCustomer: ${customerName}\nSlots: ${selectedSlots.length}`);
                setShowOfflineBookingModal(false);
                setSelectedSlots([]);
                setCustomerName('');
                setCustomerPhone('');
                fetchData(); // Refresh slots
            } else {
                alert(data.message || 'Failed to create offline booking');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to create offline booking');
        }
    };

    const handleSlotSelection = (slotId: string, slot: Slot) => {
        if (slot.status !== 'available') {
            alert('Only available slots can be selected for booking');
            return;
        }

        setSelectedSlots(prev => {
            if (prev.includes(slotId)) {
                return prev.filter(id => id !== slotId);
            } else {
                return [...prev, slotId];
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const config = {
            available: { variant: 'success' as const, label: 'Available' },
            booked: { variant: 'danger' as const, label: 'Booked' },
            blocked: { variant: 'default' as const, label: 'Blocked' },
        };
        return config[status as keyof typeof config] || config.available;
    };

    const filteredSlots = slots.filter(slot => {
        if (filterCourt && slot.courtId._id !== filterCourt) return false;
        if (filterDate && slot.date !== filterDate) return false;
        if (filterStatus !== 'all' && slot.status !== filterStatus) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading slots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Manage Slots
                        </h1>
                        <p className="text-lg text-gray-600">
                            Create and manage time slots for your courts
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowOfflineBookingModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Book Offline
                        </button>
                        <Button onClick={() => setShowCreateModal(true)}>
                            + Create Slots
                        </Button>
                    </div>
                </div>

                {/* Offline Booking Info */}
                {selectedSlots.length > 0 && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-green-800">
                                    {selectedSlots.length} slot(s) selected for offline booking
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Click &quot;Book Offline&quot; to enter customer details and create the booking
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Court
                            </label>
                            <select
                                value={filterCourt}
                                onChange={(e) => setFilterCourt(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">All Courts</option>
                                {courts.map(court => (
                                    <option key={court._id} value={court._id}>
                                        {court.name} - {court.venueId.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'booked' | 'blocked')}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setFilterCourt('');
                                    setFilterDate('');
                                    setFilterStatus('all');
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slots Table */}
                {filteredSlots.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No slots found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {courts.length === 0
                                ? 'Add courts first, then create slots.'
                                : 'Get started by creating slots for your courts.'}
                        </p>
                        {courts.length > 0 && (
                            <div className="mt-6">
                                <Button onClick={() => setShowCreateModal(true)}>
                                    + Create Slots
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Court / Venue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
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
                                    {filteredSlots.map((slot) => (
                                        <tr key={slot._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSlots.includes(slot._id)}
                                                    onChange={() => handleSlotSelection(slot._id, slot)}
                                                    disabled={slot.status !== 'available'}
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {typeof slot.courtId === 'object' ? slot.courtId.name : 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {typeof slot.courtId === 'object' && typeof slot.courtId.venueId === 'object'
                                                        ? slot.courtId.venueId.name
                                                        : 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {typeof slot.courtId === 'object' && typeof slot.courtId.sportId === 'object'
                                                        ? slot.courtId.sportId.name
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(slot.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {slot.startTime} - {slot.endTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">₹{slot.price}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusBadge(slot.status).variant}>
                                                    {getStatusBadge(slot.status).label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {slot.status !== 'booked' && (
                                                    <button
                                                        onClick={() => handleToggleBlock(slot._id, slot.status)}
                                                        className={slot.status === 'blocked'
                                                            ? 'text-green-600 hover:text-green-900'
                                                            : 'text-yellow-600 hover:text-yellow-900'}
                                                    >
                                                        {slot.status === 'blocked' ? 'Unblock' : 'Block'}
                                                    </button>
                                                )}
                                                {slot.status === 'booked' && (
                                                    <span className="text-gray-400">Booked</span>
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

            {/* Create Slots Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Create Slots
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Court *
                                </label>
                                <select
                                    value={selectedCourt}
                                    onChange={(e) => setSelectedCourt(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Choose a court</option>
                                    {courts.map(court => (
                                        <option key={court._id} value={court._id}>
                                            {court.name} - {court.venueId.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Date *
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                This will create hourly slots based on the venue&apos;s operating hours.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleCreateSlots} className="flex-1">
                                Create Slots
                            </Button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setSelectedCourt('');
                                    setSelectedDate(new Date().toISOString().split('T')[0]);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offline Booking Modal */}
            {showOfflineBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Create Offline Booking
                        </h2>

                        {selectedSlots.length > 0 && (
                            <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>{selectedSlots.length}</strong> slot(s) selected
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Total: ₹{selectedSlots.reduce((sum, slotId) => {
                                        const slot = slots.find(s => s._id === slotId);
                                        return sum + (slot?.price || 0);
                                    }, 0)}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Phone *
                                </label>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                    required
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                💡 Select slots from the table above, then enter customer details here.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleOfflineBooking}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={selectedSlots.length === 0 || !customerName.trim() || !customerPhone.trim()}
                            >
                                Create Booking
                            </button>
                            <button
                                onClick={() => {
                                    setShowOfflineBookingModal(false);
                                    setCustomerName('');
                                    setCustomerPhone('');
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
