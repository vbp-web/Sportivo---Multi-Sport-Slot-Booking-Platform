'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api-config';

export default function OwnerPaymentSettingsPage() {
    const router = useRouter();
    const [upiId, setUpiId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchPaymentSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(getApiUrl('owner/payment-settings'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUpiId(data.data.upiId || '');
                setQrCodeUrl(data.data.upiQrCode || '');
            }
        } catch (err: unknown) {
            console.error('Error fetching payment settings:', err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchPaymentSettings();
    }, [fetchPaymentSettings]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setQrCodeFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCodeUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!upiId) {
            setError('UPI ID is required');
            return;
        }

        if (!qrCodeUrl && !qrCodeFile) {
            setError('QR Code is required');
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('token');

            // For now, we'll send the base64 image directly
            // In production, you should upload to a cloud storage service
            const response = await fetch(getApiUrl('owner/payment-settings'), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    upiId,
                    upiQrCode: qrCodeUrl
                })
            });

            if (response.ok) {
                setSuccess('Payment settings saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to save settings');
            }
        } catch {
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Payment Settings
                    </h1>
                    <p className="text-lg text-gray-400">
                        Configure your UPI payment details for receiving booking payments
                    </p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                        {success}
                    </div>
                )}

                {/* Settings Form */}
                <div className="bg-gray-900/60 rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* UPI ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="yourname@upi"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                            </p>
                        </div>

                        {/* QR Code Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                UPI QR Code <span className="text-red-500">*</span>
                            </label>

                            {/* Current QR Code Preview */}
                            {qrCodeUrl && (
                                <div className="mb-4 text-center">
                                    <div className="inline-block p-4 bg-gray-900/60 border-2 border-white/[0.08] rounded-lg">
                                        <Image
                                            src={qrCodeUrl}
                                            alt="UPI QR Code"
                                            width={200}
                                            height={200}
                                            className="mx-auto"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-400">Current QR Code</p>
                                </div>
                            )}

                            {/* Upload New QR Code */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="qr-code"
                                />
                                <label htmlFor="qr-code" className="cursor-pointer">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-400">
                                        {qrCodeFile ? qrCodeFile.name : 'Click to upload QR code image'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                </label>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Upload your UPI QR code image. Users will scan this to make payments.
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">How to get your UPI QR Code:</h4>
                            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                <li>Open your UPI app (Paytm, PhonePe, Google Pay, etc.)</li>
                                <li>Go to &quot;Receive Money&quot; or &quot;My QR Code&quot; section</li>
                                <li>Take a screenshot of your QR code</li>
                                <li>Upload the screenshot here</li>
                            </ol>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                onClick={() => router.push('/owner/dashboard')}
                                className="flex-1 bg-gray-9000 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-yellow-900 mb-1">Important:</h4>
                            <p className="text-sm text-yellow-800">
                                Make sure your UPI ID and QR code are correct. Users will use these details to make booking payments.
                                You can update these settings anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
