'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import { getApiUrl } from '@/lib/api-config';

interface Plan {
    _id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    durationType: 'monthly' | 'yearly';
    features: string[];
    maxVenues: number;
    maxCourts: number;
    maxBookings?: number;
    maxMessages?: number;
    isUnlimitedBookings: boolean;
    isUnlimitedMessages: boolean;
    isActive: boolean;
}

interface Subscription {
    _id: string;
    planId: Plan;
    startDate: string;
    endDate: string;
    status: string;
    amount: number;
    bookingsCount: number;
    messagesCount: number;
}

export default function OwnerSubscriptionPage() {
    const router = useRouter();
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSubscriptionData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            // Fetch current subscription
            const subResponse = await fetch(getApiUrl('owner/subscription'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (subResponse.ok) {
                const subData = await subResponse.json();
                setCurrentSubscription(subData.data);
            }

            // Fetch available plans
            const plansResponse = await fetch(getApiUrl('plans'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                setPlans(plansData.data || []);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchSubscriptionData();
    }, [fetchSubscriptionData]);

    const handleSubscribe = async (planId: string) => {
        // Navigate to payment page
        router.push(`/owner/subscription/payment?planId=${planId}`);
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Subscription
                    </h1>
                    <p className="text-lg text-gray-400">
                        Manage your subscription plan
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {/* Current Subscription */}
                {currentSubscription && (() => {
                    const isExpired = new Date(currentSubscription.endDate) < new Date();
                    const daysRemaining = getDaysRemaining(currentSubscription.endDate);
                    const displayStatus = isExpired ? 'expired' : currentSubscription.status;

                    return (
                        <div className={`mb-8 rounded-lg shadow-lg p-6 text-white ${isExpired ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Current Plan</h2>
                                    <p className={isExpired ? 'text-red-100 mb-4' : 'text-blue-100 mb-4'}>
                                        {currentSubscription.planId && typeof currentSubscription.planId === 'object' ? currentSubscription.planId.name : 'N/A'}
                                    </p>
                                    <div className="space-y-2">
                                        <p className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {isExpired ? 'Expired on:' : 'Expires:'} {new Date(currentSubscription.endDate).toLocaleDateString()}
                                        </p>
                                        {!isExpired && (
                                            <p className="flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
                                            </p>
                                        )}
                                        {isExpired && (
                                            <p className="flex items-center text-red-100 font-semibold">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Please renew your subscription to continue
                                            </p>
                                        )}
                                    </div>

                                    {/* Usage Stats */}
                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className={`p-3 rounded-lg ${isExpired ? 'bg-red-400/20' : 'bg-blue-400/20'} border border-white/10`}>
                                            <p className="text-xs uppercase font-bold opacity-80">Bookings</p>
                                            <p className="text-xl font-bold">
                                                {currentSubscription.bookingsCount || 0}
                                                <span className="text-sm font-normal opacity-70 ml-1">
                                                    / {currentSubscription.planId?.isUnlimitedBookings ? '∞' : (typeof currentSubscription.planId?.maxBookings === 'number' ? currentSubscription.planId.maxBookings : 0)}
                                                </span>
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${isExpired ? 'bg-red-400/20' : 'bg-blue-400/20'} border border-white/10`}>
                                            <p className="text-xs uppercase font-bold opacity-80">Messages</p>
                                            <p className="text-xl font-bold">
                                                {currentSubscription.messagesCount || 0}
                                                <span className="text-sm font-normal opacity-70 ml-1">
                                                    / {currentSubscription.planId?.isUnlimitedMessages ? '∞' : (typeof currentSubscription.planId?.maxMessages === 'number' ? currentSubscription.planId.maxMessages : 0)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${isExpired
                                        ? 'bg-red-700 text-white'
                                        : displayStatus === 'active'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-yellow-500 text-white'
                                        }`}>
                                        {displayStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Available Plans */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {currentSubscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
                    </h2>

                    {plans.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900/60 rounded-lg shadow">
                            <p className="text-gray-500">No subscription plans available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan._id} className="bg-gray-900/60 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
                                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold">₹{plan.price}</span>
                                            <span className="ml-2 text-blue-100">/{plan.durationType === 'monthly' ? 'month' : 'year'}</span>
                                        </div>
                                        <p className="text-sm text-blue-100 mt-2">{plan.duration} days</p>
                                    </div>

                                    <div className="px-6 py-8">
                                        {plan.description && (
                                            <p className="text-gray-400 mb-6">{plan.description}</p>
                                        )}

                                        <ul className="space-y-3 mb-8">
                                            <li className="flex items-center text-gray-300">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {plan.isUnlimitedBookings ? 'Unlimited' : `${plan.maxBookings || 0}`} bookings
                                            </li>
                                            <li className="flex items-center text-gray-300">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {plan.isUnlimitedMessages ? 'Unlimited' : `${plan.maxMessages || 0}`} messages
                                            </li>
                                            <li className="flex items-center text-gray-300">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Up to {plan.maxVenues} venues
                                            </li>
                                            <li className="flex items-center text-gray-300">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Up to {plan.maxCourts} courts
                                            </li>
                                            {plan.features && plan.features.length > 0 && plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={() => handleSubscribe(plan._id)}
                                            className="w-full"
                                        >
                                            {currentSubscription ? 'Upgrade to this Plan' : 'Subscribe Now'}
                                        </Button>
                                    </div>
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
