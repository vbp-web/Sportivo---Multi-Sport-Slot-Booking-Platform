'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CourtFormProps {
    court?: {
        id: string;
        name: string;
        sportId: string;
        description?: string;
        capacity?: number;
    };
    sports: Array<{ id: string; name: string }>;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
}

export default function CourtForm({ court, sports, onSubmit, onCancel }: CourtFormProps) {
    const [formData, setFormData] = useState({
        name: court?.name || '',
        sportId: court?.sportId || '',
        description: court?.description || '',
        capacity: court?.capacity?.toString() || '',
    });
    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = 'Court name is required';
        if (!formData.sportId) newErrors.sportId = 'Please select a sport';
        if (formData.capacity && parseInt(formData.capacity) < 1) {
            newErrors.capacity = 'Capacity must be at least 1';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
            };
            await onSubmit(submitData);
        } catch (error: any) {
            setErrors({ general: error.message || 'Failed to save court' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                    {court ? 'Edit Court' : 'Add New Court'}
                </h2>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Court Name"
                        type="text"
                        placeholder="e.g., Court 1, Main Ground"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sport
                        </label>
                        <select
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.sportId
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2`}
                            value={formData.sportId}
                            onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                        >
                            <option value="">Select a sport</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={sport.id}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                        {errors.sportId && (
                            <p className="mt-1 text-sm text-red-600">{errors.sportId}</p>
                        )}
                    </div>

                    <Input
                        label="Capacity (Optional)"
                        type="number"
                        placeholder="Maximum number of players"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        error={errors.capacity}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition-all"
                            rows={3}
                            placeholder="Additional details about the court"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
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
                            {court ? 'Update Court' : 'Add Court'}
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
