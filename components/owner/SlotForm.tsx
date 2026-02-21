'use client';

import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface SlotFormProps {
    slot?: {
        id: string;
        courtId: string;
        date: string;
        startTime: string;
        endTime: string;
        price: number;
    };
    courts: Array<{ id: string; name: string; sportName: string }>;
    onSubmit: (data: { courtId: string; date: string; startTime: string; endTime: string; price: number }) => Promise<void>;
    onCancel?: () => void;
}

export default function SlotForm({ slot, courts, onSubmit, onCancel }: SlotFormProps) {
    const [formData, setFormData] = useState({
        courtId: slot?.courtId || '',
        date: slot?.date || '',
        startTime: slot?.startTime || '',
        endTime: slot?.endTime || '',
        price: slot?.price?.toString() || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.courtId) newErrors.courtId = 'Please select a court';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.startTime) newErrors.startTime = 'Start time is required';
        if (!formData.endTime) newErrors.endTime = 'End time is required';
        if (!formData.price) newErrors.price = 'Price is required';
        else if (parseFloat(formData.price) < 0) newErrors.price = 'Price cannot be negative';

        // Validate time range
        if (formData.startTime && formData.endTime) {
            const start = new Date(`2000-01-01T${formData.startTime}`);
            const end = new Date(`2000-01-01T${formData.endTime}`);
            if (end <= start) {
                newErrors.endTime = 'End time must be after start time';
            }
        }

        // Validate date is not in the past
        if (formData.date) {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = 'Date cannot be in the past';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const submitData = {
                courtId: formData.courtId,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                price: parseFloat(formData.price),
            };
            await onSubmit(submitData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save slot';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                    {slot ? 'Edit Slot' : 'Create New Slot'}
                </h2>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Court
                        </label>
                        <select
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.courtId
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2`}
                            value={formData.courtId}
                            onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                        >
                            <option value="">Select a court</option>
                            {courts.map((court) => (
                                <option key={court.id} value={court.id}>
                                    {court.name} ({court.sportName})
                                </option>
                            ))}
                        </select>
                        {errors.courtId && (
                            <p className="mt-1 text-sm text-red-600">{errors.courtId}</p>
                        )}
                    </div>

                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        error={errors.date}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            error={errors.startTime}
                            icon={
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />

                        <Input
                            label="End Time"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            error={errors.endTime}
                            icon={
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    <Input
                        label="Price (₹)"
                        type="number"
                        step="0.01"
                        placeholder="Enter price for this slot"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        error={errors.price}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> You can create multiple slots for the same court on different dates or times.
                        </p>
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
                            {slot ? 'Update Slot' : 'Create Slot'}
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
