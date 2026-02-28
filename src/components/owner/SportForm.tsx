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
    };
    onSubmit: (data: { name: string; description: string }) => Promise<void>;
    onCancel?: () => void;
}

export default function SportForm({ sport, onSubmit, onCancel }: SportFormProps) {
    const [formData, setFormData] = useState({
        name: sport?.name || '',
        description: sport?.description || '',
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

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-white">
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border-2 border-white/[0.08] focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition-all"
                            rows={3}
                            placeholder="Brief description of the sport"
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
