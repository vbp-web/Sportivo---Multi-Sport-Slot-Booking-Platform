'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SportFormProps {
    sport?: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
        isActive: boolean;
    };
    onSubmit: (data: { name: string; description: string; icon: string; isActive: boolean }) => Promise<void>;
    onCancel?: () => void;
}

export default function SportForm({ sport, onSubmit, onCancel }: SportFormProps) {
    const [formData, setFormData] = useState({
        name: sport?.name || '',
        description: sport?.description || '',
        icon: sport?.icon || '',
        isActive: sport?.isActive ?? true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Sport name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save sport';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const popularSports = [
        { name: 'Cricket', icon: '🏏' },
        { name: 'Football', icon: '⚽' },
        { name: 'Badminton', icon: '🏸' },
        { name: 'Tennis', icon: '🎾' },
        { name: 'Basketball', icon: '🏀' },
        { name: 'Volleyball', icon: '🏐' },
        { name: 'Table Tennis', icon: '🏓' },
        { name: 'Swimming', icon: '🏊' },
    ];

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                    {sport ? 'Edit Sport' : 'Add New Sport'}
                </h2>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Sport Name"
                        type="text"
                        placeholder="e.g., Cricket, Football, Badminton"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />

                    {/* Quick Select Popular Sports */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick Select (Optional)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {popularSports.map((s) => (
                                <button
                                    key={s.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, name: s.name, icon: s.icon })}
                                    className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all text-center"
                                >
                                    <div className="text-2xl mb-1">{s.icon}</div>
                                    <div className="text-xs text-gray-600">{s.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Input
                        label="Icon (Emoji)"
                        type="text"
                        placeholder="e.g., 🏏 ⚽ 🏸"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        icon={
                            <span className="text-xl">{formData.icon || '🎯'}</span>
                        }
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition-all"
                            rows={3}
                            placeholder="Brief description of the sport"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Sport is active and available for venues
                        </label>
                    </div>

                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            {sport ? 'Update Sport' : 'Add Sport'}
                        </Button>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
