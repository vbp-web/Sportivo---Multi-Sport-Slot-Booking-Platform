'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface AdminSettings {
    _id: string;
    upiId: string;
    qrCodeUrl: string;
    businessName: string;
}

interface Plan {
    _id: string;
    name: string;
    price: number;
    duration: number; // Duration in days (30 or 365)
    durationType: 'monthly' | 'yearly';
}

function SubscriptionPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('planId');

    const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [utr, setUtr] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!planId) {
            router.push('/owner/subscription');
            return;
        }
        fetchPaymentData();
    }, [planId]);

    const fetchPaymentData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch admin payment settings (public endpoint - temporary location)
            const settingsResponse = await fetch('http://localhost:5000/api/plans/settings/payment');

            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                setAdminSettings(settingsData.data);
            } else {
                setError('Admin payment settings not configured. Please contact support.');
            }

            // Fetch plan details
            const plansResponse = await fetch('http://localhost:5000/api/plans', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                const selectedPlan = plansData.data?.find((p: Plan) => p._id === planId);
                if (selectedPlan) {
                    setPlan(selectedPlan);
                } else {
                    setError('Plan not found');
                }
            }
        } catch (err: any) {
            setError(err.message);
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

        if (!paymentProof && !utr) {
            alert('Please upload payment proof or enter UTR number');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('planId', planId!);
            if (paymentProof) formData.append('paymentProof', paymentProof);
            if (utr) formData.append('utr', utr);

            const response = await fetch('http://localhost:5000/api/owner/subscription', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Payment submitted successfully! Your subscription will be activated after verification.');
                router.push('/owner/subscription');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to submit payment');
            }
        } catch (err) {
            console.error('Error submitting payment:', err);
            alert('Failed to submit payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error || !adminSettings || !plan) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 text-lg">{error || 'Unable to load payment details'}</p>
                        <Button onClick={() => router.push('/owner/subscription')} className="mt-4">
                            Back to Subscription
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Complete Payment
                    </h1>
                    <p className="text-lg text-gray-600">
                        Subscribe to {plan.name} - ₹{plan.price}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Instructions */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

                        {/* QR Code */}
                        <div className="mb-6 text-center">
                            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                <Image
                                    src={adminSettings.qrCodeUrl}
                                    alt="Payment QR Code"
                                    width={250}
                                    height={250}
                                    className="mx-auto"
                                />
                            </div>
                            <p className="mt-3 text-sm text-gray-600">Scan this QR code to pay</p>
                        </div>

                        {/* UPI ID */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                UPI ID
                            </label>
                            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                                <span className="font-mono text-lg text-gray-900">{adminSettings.upiId}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(adminSettings.upiId);
                                        alert('UPI ID copied to clipboard!');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Plan:</span>
                                    <span className="font-medium text-gray-900">{plan.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium text-gray-900">
                                        {plan.durationType === 'monthly' ? 'Monthly' : 'Yearly'} ({plan.duration} days)
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="text-gray-900 font-semibold">Total Amount:</span>
                                    <span className="font-bold text-blue-600 text-lg">₹{plan.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Payment Proof */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Payment Proof</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* UTR Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    UTR / Transaction ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    placeholder="Enter UTR or Transaction ID"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Payment Screenshot */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Screenshot
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="payment-proof"
                                    />
                                    <label htmlFor="payment-proof" className="cursor-pointer">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            {paymentProof ? paymentProof.name : 'Click to upload payment screenshot'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                    </label>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 mb-2">Important Instructions:</h4>
                                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                                    <li>Make payment using the QR code or UPI ID above</li>
                                    <li>Upload a clear screenshot of the payment confirmation</li>
                                    <li>Enter the UTR/Transaction ID for faster verification</li>
                                    <li>Your subscription will be activated after payment verification</li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => router.push('/owner/subscription')}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Payment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SubscriptionPaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <SubscriptionPaymentContent />
        </Suspense>
    );
}
