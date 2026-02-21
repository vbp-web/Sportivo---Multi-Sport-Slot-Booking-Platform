'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getApiUrl } from '@/lib/api-config';

interface City {
    _id: string;
    name: string;
    state: string;
}

interface Sport {
    _id: string;
    name: string;
}

export default function AddVenuePage() {
    const router = useRouter();
    const [cities, setCities] = useState<City[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        pincode: '',
        contactNumber: '',
        amenities: '',
        openingTime: '06:00',
        closingTime: '23:00',
        selectedSports: [] as string[]
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch cities
            const citiesRes = await fetch(getApiUrl('cities'));
            if (citiesRes.ok) {
                const citiesData = await citiesRes.json();
                setCities(citiesData.data || []);
            }

            // Fetch sports
            const sportsRes = await fetch(getApiUrl('sports'));
            if (sportsRes.ok) {
                const sportsData = await sportsRes.json();
                setSports(sportsData.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSportToggle = (sportId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedSports: prev.selectedSports.includes(sportId)
                ? prev.selectedSports.filter(id => id !== sportId)
                : [...prev.selectedSports, sportId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        // Validation
        const newErrors: any = {};
        if (!formData.name) newErrors.name = 'Venue name is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
        if (formData.selectedSports.length === 0) newErrors.sports = 'Select at least one sport';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/venues'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode,
                    contactNumber: formData.contactNumber,
                    amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
                    openingTime: formData.openingTime,
                    closingTime: formData.closingTime,
                    sports: formData.selectedSports
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Venue added successfully!');
                router.push('/owner/venues');
            } else {
                alert(data.message || 'Failed to add venue');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add venue');
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
                        Back to Venues
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900">Add New Venue</h1>
                    <p className="text-lg text-gray-600 mt-2">Fill in the details to add a new venue</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Venue Name *"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        error={errors.name}
                                        placeholder="e.g., SportZone Arena"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                        rows={3}
                                        placeholder="Brief description of your venue..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Address *"
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        error={errors.address}
                                        placeholder="Full address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(city => (
                                            <option key={city._id} value={city.name}>
                                                {city.name}, {city.state}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                                </div>
                                <Input
                                    label="Pincode *"
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    error={errors.pincode}
                                    placeholder="6-digit pincode"
                                />
                                <Input
                                    label="Contact Number *"
                                    type="tel"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    error={errors.contactNumber}
                                    placeholder="10-digit number"
                                />
                            </div>
                        </div>

                        {/* Sports Offered */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sports Offered *</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {sports.map(sport => (
                                    <button
                                        key={sport._id}
                                        type="button"
                                        onClick={() => handleSportToggle(sport._id)}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.selectedSports.includes(sport._id)
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {sport.name}
                                    </button>
                                ))}
                            </div>
                            {errors.sports && <p className="mt-2 text-sm text-red-600">{errors.sports}</p>}
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                            <Input
                                label="Amenities (comma separated)"
                                type="text"
                                value={formData.amenities}
                                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                placeholder="e.g., Parking, Washroom, Changing Room, Water"
                            />
                        </div>

                        {/* Timings */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Opening Time"
                                    type="time"
                                    value={formData.openingTime}
                                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                />
                                <Input
                                    label="Closing Time"
                                    type="time"
                                    value={formData.closingTime}
                                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1">
                                {submitting ? 'Adding Venue...' : 'Add Venue'}
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
