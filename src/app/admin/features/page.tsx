'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getApiUrl } from '@/lib/api-config';

interface Feature {
    _id: string;
    name: string;
    description?: string;
    category: 'booking' | 'communication' | 'analytics' | 'support' | 'automation' | 'other';
    isActive: boolean;
    createdAt: string;
}

const categoryColors = {
    booking: 'bg-blue-100 text-blue-800',
    communication: 'bg-green-100 text-green-800',
    analytics: 'bg-purple-100 text-purple-800',
    support: 'bg-yellow-100 text-yellow-800',
    automation: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800'
};

export default function AdminFeaturesPage() {
    const router = useRouter();
    const [features, setFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'other' as Feature['category']
    });

    const fetchFeatures = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('features'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeatures(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching features:', error);
        } finally {
            setLoading(false);
        }
    }, []);

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

        fetchFeatures();
    }, [fetchFeatures, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const url = editingFeature
                ? getApiUrl(`features/${editingFeature._id}`)
                : getApiUrl('features');

            const method = editingFeature ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                setShowModal(false);
                setFormData({ name: '', description: '', category: 'other' });
                setEditingFeature(null);
                fetchFeatures();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save feature');
        }
    };

    const handleEdit = (feature: Feature) => {
        setEditingFeature(feature);
        setFormData({
            name: feature.name,
            description: feature.description || '',
            category: feature.category
        });
        setShowModal(true);
    };

    const handleDelete = async (featureId: string) => {
        if (!confirm('Are you sure you want to delete this feature?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`features/${featureId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchFeatures();
            } else {
                alert(data.message || 'Failed to delete feature');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete feature');
        }
    };

    const handleToggleStatus = async (featureId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`features/${featureId}/toggle`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchFeatures();
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to toggle status');
        }
    };

    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, Feature[]>);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading features...</p>
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
                            Plan Features
                        </h1>
                        <p className="text-lg text-gray-600">
                            Manage features that can be assigned to subscription plans
                        </p>
                    </div>
                    <Button onClick={() => {
                        setEditingFeature(null);
                        setFormData({ name: '', description: '', category: 'other' });
                        setShowModal(true);
                    }}>
                        + Add New Feature
                    </Button>
                </div>

                {features.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No features</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a feature.</p>
                        <div className="mt-6">
                            <Button onClick={() => setShowModal(true)}>
                                + Add New Feature
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                            <div key={category}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[category as Feature['category']]}`}>
                                        {category}
                                    </span>
                                    <span className="text-gray-500 text-lg">({categoryFeatures.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categoryFeatures.map((feature) => (
                                        <div key={feature._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900 flex-1">{feature.name}</h3>
                                                <Badge variant={feature.isActive ? 'success' : 'default'}>
                                                    {feature.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {feature.description && (
                                                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                                            )}
                                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => handleEdit(feature)}
                                                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(feature._id)}
                                                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${feature.isActive
                                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                        }`}
                                                >
                                                    {feature.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(feature._id)}
                                                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                            {editingFeature ? 'Edit Feature' : 'Add New Feature'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feature Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., SMS Notifications"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Feature['category'] })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="booking">Booking</option>
                                    <option value="communication">Communication</option>
                                    <option value="analytics">Analytics</option>
                                    <option value="support">Support</option>
                                    <option value="automation">Automation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                    placeholder="Brief description of the feature..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingFeature ? 'Update' : 'Create'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingFeature(null);
                                        setFormData({ name: '', description: '', category: 'other' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
