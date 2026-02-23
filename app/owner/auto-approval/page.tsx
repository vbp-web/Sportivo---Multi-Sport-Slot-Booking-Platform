'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { getApiUrl } from '@/lib/api-config';

interface AutoApprovalSettings {
    enabled: boolean;
    requirePaymentProof: boolean;
    notifyOnAutoApproval: boolean;
    amountRules: {
        enabled: boolean;
        maxAutoApproveAmount?: number;
    };
    customerRules: {
        enabled: boolean;
        minimumPreviousBookings: number;
        requireVerifiedPhone: boolean;
    };
    aiSettings: {
        enabled: boolean;
        trustScoreThreshold: number;
    };
}

interface Stats {
    totalBookings: number;
    autoApproved: number;
    manualApproved: number;
    autoApprovalRate: string;
}

export default function AutoApprovalPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<AutoApprovalSettings | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch settings
            const settingsRes = await fetch(getApiUrl('owner/auto-approval'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                setSettings(settingsData.data.autoApproval);
            } else if (settingsRes.status === 403) {
                setError('This feature is not available in your current plan. Please upgrade to unlock Auto Approval.');
            }

            // Fetch stats
            const statsRes = await fetch(getApiUrl('owner/auto-approval/stats'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.data);
            }
        } catch (err: unknown) {
            console.error('Error fetching auto-approval data:', err);
            setError('Failed to load auto-approval settings');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('owner/auto-approval'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setSuccess('Settings updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update settings');
            }
        } catch {
            setError('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <Sidebar role="owner" />
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    🤖 Auto Approval System
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Pro Feature</span>
                                </h1>
                                <p className="text-gray-600 mt-2">Manage how your bookings are automatically confirmed</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving || !settings}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium flex items-center gap-2"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 animate-shake">
                                ⚠️ {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3 animate-bounce">
                                ✅ {success}
                            </div>
                        )}

                        {!settings && !error ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <div className="text-6xl mb-4">🔒</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Locked</h2>
                                <p className="text-gray-600 mb-6">Upgrade your subscription to use the Auto Approval System and automate your business.</p>
                                <button
                                    onClick={() => router.push('/owner/subscription')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                                >
                                    View Plans
                                </button>
                            </div>
                        ) : settings && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Rules */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Main Toggle */}
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        <div className="p-6 flex items-center justify-between border-b bg-gray-50/50">
                                            <div>
                                                <h3 className="font-bold text-gray-900">System Status</h3>
                                                <p className="text-sm text-gray-500">Enable or disable automatic booking confirmations</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enabled}
                                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="paymentProof"
                                                    checked={settings.requirePaymentProof}
                                                    onChange={(e) => setSettings({ ...settings, requirePaymentProof: e.target.checked })}
                                                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                                                />
                                                <label htmlFor="paymentProof" className="cursor-pointer">
                                                    <span className="block font-medium text-gray-900">Require Payment Proof</span>
                                                    <span className="text-sm text-gray-500">Only auto-approve if the customer has uploaded a screenshot of payment.</span>
                                                </label>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="notify"
                                                    checked={settings.notifyOnAutoApproval}
                                                    onChange={(e) => setSettings({ ...settings, notifyOnAutoApproval: e.target.checked })}
                                                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                                                />
                                                <label htmlFor="notify" className="cursor-pointer">
                                                    <span className="block font-medium text-gray-900">Notify me on Auto-Approval</span>
                                                    <span className="text-sm text-gray-500">Receive a notification whenever a booking is automatically accepted.</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Rules */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Amount Rules */}
                                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-400">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">💰 Price Limits</h4>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.amountRules.enabled}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        amountRules: { ...settings.amountRules, enabled: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 text-yellow-500 rounded"
                                                />
                                            </div>
                                            <div className={!settings.amountRules.enabled ? 'opacity-50 grayscale' : ''}>
                                                <p className="text-xs text-gray-500 mb-3">Auto-approve only for bookings below a certain amount.</p>
                                                <div className="space-y-3">
                                                    <label className="block">
                                                        <span className="text-xs font-bold text-gray-600 uppercase">Max Amount (₹)</span>
                                                        <input
                                                            type="number"
                                                            value={settings.amountRules.maxAutoApproveAmount || ''}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                amountRules: { ...settings.amountRules, maxAutoApproveAmount: Number(e.target.value) }
                                                            })}
                                                            disabled={!settings.amountRules.enabled}
                                                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                                            placeholder="e.g. 2000"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Rules */}
                                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">👥 Customer Rules</h4>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.customerRules.enabled}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        customerRules: { ...settings.customerRules, enabled: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 text-green-500 rounded"
                                                />
                                            </div>
                                            <div className={!settings.customerRules.enabled ? 'opacity-50 grayscale' : ''}>
                                                <p className="text-xs text-gray-500 mb-3">Target trustable repeat customers.</p>
                                                <div className="space-y-4">
                                                    <label className="block">
                                                        <span className="text-xs font-bold text-gray-600 uppercase">Min. Previous Bookings</span>
                                                        <input
                                                            type="number"
                                                            value={settings.customerRules.minimumPreviousBookings}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                customerRules: { ...settings.customerRules, minimumPreviousBookings: Number(e.target.value) }
                                                            })}
                                                            disabled={!settings.customerRules.enabled}
                                                            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                        />
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="verifiedPhone"
                                                            checked={settings.customerRules.requireVerifiedPhone}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                customerRules: { ...settings.customerRules, requireVerifiedPhone: e.target.checked }
                                                            })}
                                                            disabled={!settings.customerRules.enabled}
                                                            className="w-4 h-4 text-green-600 rounded"
                                                        />
                                                        <label htmlFor="verifiedPhone" className="text-sm text-gray-600">Verified Phone Only</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Settings (Enterprise) */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Enterprise Only</div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-white/10 rounded-lg text-2xl">🧠</div>
                                                <h4 className="text-xl font-bold">AI Trust Intelligence</h4>
                                            </div>
                                            <p className="text-indigo-100 mb-6">Let our AI analyze customer behavior, distance, and booking patterns to detect fraud and auto-approve high-trust players.</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/40 w-2/3"></div>
                                                </div>
                                                <span className="font-bold">Coming Soon</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 right-0 opacity-10 text-9xl">🤖</div>
                                    </div>
                                </div>

                                {/* Right Column: Stats */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden relative">
                                        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            📊 Performance
                                            <span className="text-[10px] text-gray-400 font-normal">(Last 30 Days)</span>
                                        </h4>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-500">Auto-Approval Rate</span>
                                                    <span className="font-bold text-blue-600">{stats?.autoApprovalRate || '0'}%</span>
                                                </div>
                                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000"
                                                        style={{ width: `${stats?.autoApprovalRate || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-blue-50 rounded-xl text-center">
                                                    <div className="text-2xl font-bold text-blue-700">{stats?.autoApproved || 0}</div>
                                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Auto Accepted</div>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                                    <div className="text-2xl font-bold text-gray-700">{stats?.manualApproved || 0}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Manual Reviews</div>
                                                </div>
                                            </div>

                                            <div className="border-t pt-6">
                                                <div className="flex items-center justify-between text-sm mb-4">
                                                    <span className="text-gray-500">Efficiency Gain</span>
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Excellent</span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed italic">
                                                    &quot;This system has saved you roughly <b>{Math.round((stats?.autoApproved || 0) * 3 / 60)} hours</b> of manual effort this month.&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                                        <h5 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                                            💡 Pro Tip
                                        </h5>
                                        <p className="text-sm text-orange-700 leading-relaxed">
                                            Require <b>Payment Proof</b> for new customers, but disable it for <b>Repeat Customers</b> to give them a faster experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
