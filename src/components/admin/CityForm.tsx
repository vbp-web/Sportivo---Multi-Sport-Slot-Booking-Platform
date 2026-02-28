'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CityFormProps {
    city?: {
        id: string;
        name: string;
        state: string;
        isActive: boolean;
    };
    onSubmit: (data: { name: string; state: string; isActive: boolean }) => Promise<void>;
    onCancel?: () => void;
}

export default function CityForm({ city, onSubmit, onCancel }: CityFormProps) {
    const [formData, setFormData] = useState({
        name: city?.name || '',
        state: city?.state || '',
        isActive: city?.isActive ?? true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'City name is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save city';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-white">
                    {city ? 'Edit City' : 'Add New City'}
                </h2>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="City Name"
                        type="text"
                        placeholder="e.g., Mumbai, Delhi, Bangalore"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />

                    <Input
                        label="State"
                        type="text"
                        placeholder="e.g., Maharashtra, Karnataka"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        error={errors.state}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        }
                    />

                    <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
                            City is active and available for venue listings
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
                            {city ? 'Update City' : 'Add City'}
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
