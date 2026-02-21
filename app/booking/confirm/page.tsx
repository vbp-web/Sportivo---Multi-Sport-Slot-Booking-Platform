'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api-config';

interface BookingDetails {
    venue?: { name: string; address: string; city: string; ownerId?: string };
    court?: { name: string };
    sport?: { name: string };
    slots?: Array<{
        _id: string;
        date: string;
        startTime: string;
        endTime: string;
        price: number;
    }>;
    amount: number;
}

interface OwnerPaymentSettings {
    upiId: string;
    qrCodeUrl: string;
    businessName?: string;
}

function BookingConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [bookingDetails, setBookingDetails] = useState<BookingDetails>({ amount: 0 });
    const [ownerPaymentSettings, setOwnerPaymentSettings] = useState<OwnerPaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const venueId = searchParams.get('venueId');
    const courtId = searchParams.get('courtId');
    const sportId = searchParams.get('sportId');
    const slotId = searchParams.get('slotId');
    const slotsParam = searchParams.get('slots');
    const amount = parseFloat(searchParams.get('amount') || '0');

    useEffect(() => {
        fetchBookingDetails();
    }, []);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);

            // Fetch venue details
            const venueRes = await fetch(getApiUrl(`venues/${venueId}`));
            const venueData = await venueRes.json();

            // Fetch court details
            const courtRes = await fetch(getApiUrl(`courts/${courtId}`));
            const courtData = await courtRes.json();

            // Fetch sport details
            const sportRes = await fetch(getApiUrl(`sports/${sportId}`));
            const sportData = await sportRes.json();

            // Fetch slot(s) details
            const slotIds = slotsParam ? slotsParam.split(',') : [slotId];
            const slotsPromises = slotIds.map(id =>
                fetch(getApiUrl(`slots/${id}`)).then(res => res.json())
            );
            const slotsData = await Promise.all(slotsPromises);

            setBookingDetails({
                venue: venueData.data.venue,
                court: courtData.data,
                sport: sportData.data,
                slots: slotsData.map(s => s.data),
                amount
            });

            // Fetch owner payment settings using venue's ownerId
            console.log('Venue data:', venueData.data.venue);
            console.log('Owner ID:', venueData.data.venue.ownerId);

            if (venueData.data.venue.ownerId) {
                const paymentUrl = getApiUrl(`owner/payment-settings/public/${venueData.data.venue.ownerId}`);
                console.log('Fetching payment settings from:', paymentUrl);

                const paymentRes = await fetch(paymentUrl);
                console.log('Payment response status:', paymentRes.status);

                if (paymentRes.ok) {
                    const paymentData = await paymentRes.json();
                    console.log('Payment data:', paymentData);
                    setOwnerPaymentSettings(paymentData.data);
                } else {
                    const errorData = await paymentRes.json();
                    console.error('Payment settings error:', errorData);
                }
            } else {
                console.error('No ownerId found in venue data');
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (!paymentProof) {
            alert('Please upload payment proof');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('venueId', venueId || '');
            formData.append('courtId', courtId || '');
            formData.append('sportId', sportId || '');
            formData.append('amount', amount.toString());
            formData.append('paymentProof', paymentProof);

            // Add slot(s)
            if (slotsParam) {
                formData.append('slots', slotsParam);
            } else if (slotId) {
                formData.append('slotId', slotId);
            }

            const response = await fetch(getApiUrl('bookings'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking request submitted successfully! Please wait for owner approval.');
                router.push('/profile');
            } else {
                alert(data.message || 'Failed to create booking');
            }
        } catch (error: any) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-6"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirm Your Booking</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Booking Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Venue & Court Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Venue</p>
                                    <p className="font-semibold text-gray-900">{bookingDetails.venue?.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {bookingDetails.venue?.address}, {bookingDetails.venue?.city}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Court</p>
                                        <p className="font-semibold text-gray-900">{bookingDetails.court?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Sport</p>
                                        <p className="font-semibold text-gray-900">{bookingDetails.sport?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Slots Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Selected Slot{bookingDetails.slots && bookingDetails.slots.length > 1 ? 's' : ''}
                            </h2>

                            <div className="space-y-4">
                                {bookingDetails.slots?.map((slot, index) => (
                                    <div key={slot._id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <p className="font-semibold text-gray-900">
                                            {formatDate(slot.date)}
                                        </p>
                                        <p className="text-lg text-gray-700">
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </p>
                                        <p className="text-sm text-gray-600">₹{slot.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Details & Upload */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>

                            <div className="space-y-4">
                                {ownerPaymentSettings ? (
                                    <>
                                        {/* Owner Payment Info */}
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                                            <h3 className="font-semibold text-gray-900 mb-4">Pay to Venue Owner</h3>

                                            {/* UPI ID */}
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">UPI ID:</p>
                                                <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                                    <code className="flex-1 font-mono text-lg text-gray-900">{ownerPaymentSettings.upiId}</code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(ownerPaymentSettings.upiId);
                                                            alert('UPI ID copied!');
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>

                                            {/* QR Code */}
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 mb-3">Or scan QR code:</p>
                                                <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                                                    <img
                                                        src={ownerPaymentSettings.qrCodeUrl}
                                                        alt="Payment QR Code"
                                                        className="w-48 h-48 mx-auto"
                                                    />
                                                </div>
                                                {ownerPaymentSettings.businessName && (
                                                    <p className="text-sm text-gray-600 mt-2">{ownerPaymentSettings.businessName}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-sm text-yellow-800 font-medium mb-2">📋 Instructions:</p>
                                            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                                                <li>Pay ₹{bookingDetails.amount} using the UPI ID or QR code above</li>
                                                <li>Take a screenshot of the payment confirmation</li>
                                                <li>Upload the screenshot below</li>
                                                <li>Wait for owner to approve your booking</li>
                                            </ol>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">
                                            ⚠️ Owner payment details not available. Please contact the venue owner directly.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Proof (Screenshot/Photo)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {paymentProof && (
                                        <p className="mt-2 text-sm text-green-600">
                                            ✓ {paymentProof.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Number of Slots</span>
                                    <span className="font-semibold">{bookingDetails.slots?.length || 0}</span>
                                </div>

                                {bookingDetails.slots?.map((slot, index) => (
                                    <div key={slot._id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">Slot {index + 1}</span>
                                        <span>₹{slot.price}</span>
                                    </div>
                                ))}

                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="font-bold text-2xl text-blue-600">
                                            ₹{bookingDetails.amount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!paymentProof || submitting}
                                className="w-full"
                            >
                                {submitting ? 'Submitting...' : 'Confirm Booking'}
                            </Button>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Your booking will be confirmed after owner approval
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function BookingConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <BookingConfirmContent />
        </Suspense>
    );
}
