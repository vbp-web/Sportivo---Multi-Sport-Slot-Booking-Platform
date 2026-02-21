'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PlanForm from '@/components/admin/PlanForm';

interface Feature {
    _id: string;
    name: string;
    description?: string;
    category: string;
    isActive: boolean;
}

interface Plan {
    _id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    durationType: 'monthly' | 'yearly';
    features: string[];
    featureIds?: string[];
    maxVenues: number;
    maxCourts: number;
    maxBookings?: number;
    maxMessages?: number;
    isUnlimitedBookings: boolean;
    isUnlimitedMessages: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function AdminPlansPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/plans', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPlans(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setShowModal(true);
    };

    const handleDelete = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchPlans();
            } else {
                alert(data.message || 'Failed to delete plan');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete plan');
        }
    };

    const handleToggleStatus = async (planId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/plans/${planId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchPlans();
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to toggle status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Subscription Plans
                        </h1>
                        <p className="text-lg text-gray-600">
                            Manage subscription plans for venue owners
                        </p>
                    </div>
                    <Button onClick={() => {
                        setEditingPlan(null);
                        setShowModal(true);
                    }}>
                        + Add New Plan
                    </Button>
                </div>

                {plans.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No plans</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a subscription plan.</p>
                        <div className="mt-6">
                            <Button onClick={() => {
                                setEditingPlan(null);
                                setShowModal(true);
                            }}>
                                + Add New Plan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <Badge variant={plan.isActive ? 'success' : 'default'}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="mb-4">
                                    <div className="text-3xl font-bold text-blue-600">₹{plan.price}</div>
                                    <div className="text-sm text-gray-500">
                                        {plan.duration === 30 ? 'Monthly Plan' : 'Yearly Plan'} ({plan.duration} days)
                                    </div>
                                </div>
                                {plan.description && (
                                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                                )}
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Limits:</div>
                                    <div className="text-sm text-gray-600">
                                        • Max Venues: {plan.maxVenues}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        • Max Courts: {plan.maxCourts}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        • Bookings: {plan.isUnlimitedBookings ? 'Unlimited' : plan.maxBookings}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        • Messages: {plan.isUnlimitedMessages ? 'Unlimited' : plan.maxMessages}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx}>• {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(plan._id)}
                                        className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${plan.isActive
                                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {plan.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan._id)}
                                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                        </h2>
                        <PlanForm
                            plan={editingPlan ? {
                                _id: editingPlan._id,
                                name: editingPlan.name,
                                price: editingPlan.price,
                                duration: editingPlan.duration,
                                durationType: editingPlan.durationType,
                                maxVenues: editingPlan.maxVenues,
                                maxCourts: editingPlan.maxCourts,
                                maxBookings: editingPlan.maxBookings,
                                maxMessages: editingPlan.maxMessages,
                                isUnlimitedBookings: editingPlan.isUnlimitedBookings,
                                isUnlimitedMessages: editingPlan.isUnlimitedMessages,
                                featureIds: editingPlan.featureIds || [],
                                features: editingPlan.features || [],
                                isActive: editingPlan.isActive
                            } : undefined}
                            onSubmit={async (submitData) => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const url = editingPlan
                                        ? `http://localhost:5000/api/admin/plans/${editingPlan._id}`
                                        : 'http://localhost:5000/api/admin/plans';

                                    const method = editingPlan ? 'PUT' : 'POST';

                                    const response = await fetch(url, {
                                        method,
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(submitData)
                                    });

                                    const data = await response.json();

                                    if (response.ok) {
                                        alert(data.message);
                                        setShowModal(false);
                                        setEditingPlan(null);
                                        fetchPlans();
                                    } else {
                                        alert(data.message || 'Operation failed');
                                    }
                                } catch (error) {
                                    console.error('Error:', error);
                                    alert('Failed to save plan');
                                }
                            }}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingPlan(null);
                            }}
                        />

                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
