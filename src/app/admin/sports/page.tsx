'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getApiUrl } from '@/lib/api-config';

interface Sport {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminSportsPage() {
    const router = useRouter();
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchSports = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl('admin/sports'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSports(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sports:', error);
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

        fetchSports();
    }, [fetchSports, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const url = editingSport
                ? getApiUrl(`admin/sports/${editingSport._id}`)
                : getApiUrl('admin/sports');

            const method = editingSport ? 'PUT' : 'POST';

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
                setFormData({ name: '', description: '' });
                setEditingSport(null);
                fetchSports();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save sport');
        }
    };

    const handleEdit = (sport: Sport) => {
        setEditingSport(sport);
        setFormData({
            name: sport.name,
            description: sport.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (sportId: string) => {
        if (!confirm('Are you sure you want to delete this sport?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/sports/${sportId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchSports();
            } else {
                alert(data.message || 'Failed to delete sport');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete sport');
        }
    };

    const handleToggleStatus = async (sportId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(`admin/sports/${sportId}/toggle`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchSports();
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
                    <p className="mt-4 text-gray-600">Loading sports...</p>
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
                            Manage Sports
                        </h1>
                        <p className="text-lg text-gray-600">
                            Add, edit, or remove sports from the platform
                        </p>
                    </div>
                    <Button onClick={() => {
                        setEditingSport(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}>
                        + Add New Sport
                    </Button>
                </div>

                {sports.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sports</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new sport.</p>
                        <div className="mt-6">
                            <Button onClick={() => setShowModal(true)}>
                                + Add New Sport
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sport Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
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
                                {sports.map((sport) => (
                                    <tr key={sport._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{sport.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{sport.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={sport.isActive ? 'success' : 'default'}>
                                                {sport.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                            <button
                                                onClick={() => handleEdit(sport)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(sport._id)}
                                                className={sport.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                                            >
                                                {sport.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sport._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingSport ? 'Edit Sport' : 'Add New Sport'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sport Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Cricket, Football, Badminton"
                                />
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
                                    placeholder="Brief description of the sport..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingSport ? 'Update' : 'Create'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingSport(null);
                                        setFormData({ name: '', description: '' });
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
