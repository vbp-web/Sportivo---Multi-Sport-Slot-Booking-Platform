'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-config';

interface SidebarProps {
    role: 'user' | 'owner' | 'admin';
}

// Feature interface was here but unused

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);
    const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
    const [loadingFeatures, setLoadingFeatures] = useState(role === 'owner');

    useEffect(() => {
        if (role === 'owner') {
            fetchOwnerFeatures();
        }
    }, [role]);

    const fetchOwnerFeatures = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/owner/subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.status === 'active') {
                    const plan = data.data.planId;
                    // Handle both populated featureIds and legacy features array
                    const features: string[] = [];
                    if (plan.featureIds && Array.isArray(plan.featureIds)) {
                        plan.featureIds.forEach((f: { name: string; isActive: boolean }) => {
                            if (f.isActive) features.push(f.name);
                        });
                    }
                    if (plan.features && Array.isArray(plan.features)) {
                        plan.features.forEach((f: unknown) => {
                            if (typeof f === 'string') features.push(f);
                        });
                    }
                    setActiveFeatures(features);
                }
            }
        } catch (error) {
            console.error('Error fetching owner features:', error);
        } finally {
            setLoadingFeatures(false);
        }
    };

    const hasFeature = (featureName: string) => {
        if (loadingFeatures) return true; // Show by default while loading to avoid flicker
        return activeFeatures.includes(featureName);
    };

    const userLinks = [
        { href: '/cities', label: 'Browse Cities', icon: '🏙️' },
        { href: '/profile', label: 'My Profile', icon: '👤' },
        { href: '/bookings', label: 'My Bookings', icon: '📅' },
    ];

    const ownerLinks = [
        { href: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
        {
            href: '/owner/venues',
            label: 'My Venues',
            icon: '🏟️',
            feature: 'Venue Management'
        },
        {
            href: '/owner/courts',
            label: 'Courts',
            icon: '🎯',
            feature: 'Court & Slot Management'
        },
        {
            href: '/owner/slots',
            label: 'Slots',
            icon: '⏰',
            feature: 'Court & Slot Management'
        },
        {
            href: '/owner/bookings',
            label: 'Bookings',
            icon: '📋',
            feature: 'Booking Management Page'
        },
        {
            href: '/owner/auto-approval',
            label: 'Auto Approval',
            icon: '🤖',
            feature: 'Auto Approval System'
        },
        {
            href: '/owner/analytics',
            label: 'Analytics',
            icon: '📈',
            feature: 'Analytics Dashboard Page'
        },
        {
            href: '/owner/messages',
            label: 'Messages',
            icon: '💬',
            feature: 'Communication Suite'
        },
        { href: '/owner/subscription', label: 'Subscription', icon: '💳' },
        { href: '/owner/payment-settings', label: 'Payment Settings', icon: '💰' },
    ];

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/owners', label: 'Venue Owners', icon: '🏢' },
        { href: '/admin/bookings', label: 'All Bookings', icon: '📋' },
        { href: '/admin/cities', label: 'Cities', icon: '🏙️' },
        { href: '/admin/sports', label: 'Sports', icon: '⚽' },
        { href: '/admin/plans', label: 'Plans', icon: '💎' },
        { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
        { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { href: '/admin/settings/payment', label: 'Payment Settings', icon: '⚙️' },
    ];

    const links = role === 'user' ? userLinks : role === 'owner' ? ownerLinks : adminLinks;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex flex-col">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sportivo
                </span>
            </Link>

            {/* Navigation */}
            <nav className="space-y-2 flex-grow">
                {links.map((link: { href: string; label: string; icon: string; feature?: string; comingSoon?: boolean }) => {
                    const isActive = pathname === link.href;
                    const isComingSoon = 'comingSoon' in link && link.comingSoon;
                    const requiredFeature = link.feature;

                    // Logic to hide/show/lock based on features
                    const isLocked = requiredFeature && !hasFeature(requiredFeature);

                    if (isComingSoon || isLocked) {
                        return (
                            <button
                                key={link.href}
                                onClick={() => setShowComingSoonModal(true)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:bg-gray-50 w-full text-left relative group"
                            >
                                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{link.icon}</span>
                                <span className="font-medium">{link.label}</span>
                                <span className="ml-auto">
                                    {isLocked ? (
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    ) : (
                                        <span className="px-2 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                            Soon
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
              `}
                        >
                            <span className="text-xl">{link.icon}</span>
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-auto pt-6 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all w-full"
                >
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Locked/Coming Soon Modal */}
            {showComingSoonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
                        <button
                            onClick={() => setShowComingSoonModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-5xl">🔒</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Feature Locked
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                This feature is not included in your current subscription plan. Please upgrade your plan to unlock all premium features.
                            </p>

                            <button
                                onClick={() => {
                                    setShowComingSoonModal(false);
                                    router.push('/owner/subscription');
                                }}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all mb-3"
                            >
                                View Plans & Upgrade
                            </button>
                            <button
                                onClick={() => setShowComingSoonModal(false)}
                                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
