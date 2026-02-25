'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { getApiUrl } from '@/lib/api-config';

interface Feature {
    _id: string;
    name: string;
    category: string;
    isActive: boolean;
}

interface PlanFormProps {
    plan?: {
        _id: string;
        name: string;
        price: number;
        duration: number;
        durationType: 'monthly' | 'yearly';
        maxVenues: number;
        maxCourts: number;
        maxBookings?: number;
        maxMessages?: number;
        isUnlimitedBookings?: boolean;
        isUnlimitedMessages?: boolean;
        featureIds: string[];
        features: string[];
        isActive: boolean;
    };
    onSubmit: (data: {
        name: string;
        price: number;
        duration: number;
        durationType: string;
        maxVenues: number;
        maxCourts: number;
        maxBookings: number;
        maxMessages: number;
        isUnlimitedBookings: boolean;
        isUnlimitedMessages: boolean;
        featureIds: string[];
        features: string[];
        isActive: boolean;
    }) => Promise<void>;
    onCancel?: () => void;
}

export default function PlanForm({ plan, onSubmit, onCancel }: PlanFormProps) {
    const [formData, setFormData] = useState({
        name: plan?.name || '',
        price: plan?.price?.toString() || '',
        duration: plan?.duration?.toString() || '30',
        durationType: plan?.durationType || 'monthly',
        maxVenues: plan?.maxVenues?.toString() || '1',
        maxCourts: plan?.maxCourts?.toString() || '5',
        maxBookings: plan?.maxBookings?.toString() || '100',
        maxMessages: plan?.maxMessages?.toString() || '500',
        isUnlimitedBookings: plan?.isUnlimitedBookings ?? false,
        isUnlimitedMessages: plan?.isUnlimitedMessages ?? false,
        selectedFeatureIds: plan?.featureIds || plan?.features || [], // Attempt to use both for compatibility
        isActive: plan?.isActive ?? true,
    });
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingFeatures, setLoadingFeatures] = useState(true);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            const response = await fetch(getApiUrl('features/active'));
            if (response.ok) {
                const data = await response.json();
                setAvailableFeatures(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching features:', error);
        } finally {
            setLoadingFeatures(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Plan name is required';
        if (!formData.price) newErrors.price = 'Price is required';
        else if (parseFloat(formData.price) < 0) newErrors.price = 'Price cannot be negative';
        if (!formData.duration) newErrors.duration = 'Duration is required';
        else if (parseInt(formData.duration) < 1) newErrors.duration = 'Duration must be at least 1 day';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Get names for selected feature IDs for backward compatibility
            const selectedFeaturesNames = availableFeatures
                .filter(f => formData.selectedFeatureIds.includes(f._id) || formData.selectedFeatureIds.includes(f.name))
                .map(f => f.name);

            // If some initial featureIds were names (legacy), keep them too
            const legacyNames = formData.selectedFeatureIds.filter(id =>
                !availableFeatures.find(f => f._id === id)
            );

            const finalFeatureNames = Array.from(new Set([...selectedFeaturesNames, ...legacyNames]));

            const submitData = {
                name: formData.name,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                durationType: formData.durationType,
                maxVenues: parseInt(formData.maxVenues),
                maxCourts: parseInt(formData.maxCourts),
                maxBookings: parseInt(formData.maxBookings),
                maxMessages: parseInt(formData.maxMessages),
                isUnlimitedBookings: formData.isUnlimitedBookings,
                isUnlimitedMessages: formData.isUnlimitedMessages,
                featureIds: formData.selectedFeatureIds.filter(id => id.length === 24), // Only send valid ObjectIds
                features: finalFeatureNames,
                isActive: formData.isActive,
            };
            await onSubmit(submitData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save plan';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeatureToggle = (featureId: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedFeatureIds.includes(featureId);
            if (isSelected) {
                return {
                    ...prev,
                    selectedFeatureIds: prev.selectedFeatureIds.filter(id => id !== featureId)
                };
            } else {
                return {
                    ...prev,
                    selectedFeatureIds: [...prev.selectedFeatureIds, featureId]
                };
            }
        });
    };

    const presetPlans: Array<{ name: string; price: number; duration: number; durationType: 'monthly' | 'yearly'; maxVenues: number; maxCourts: number }> = [
        { name: 'Basic', price: 999, duration: 30, durationType: 'monthly', maxVenues: 1, maxCourts: 3 },
        { name: 'Standard', price: 2499, duration: 30, durationType: 'monthly', maxVenues: 2, maxCourts: 10 },
        { name: 'Premium', price: 4999, duration: 30, durationType: 'monthly', maxVenues: 5, maxCourts: 25 },
    ];

    const loadPreset = (preset: { name: string; price: number; duration: number; durationType: 'monthly' | 'yearly'; maxVenues: number; maxCourts: number }) => {
        setFormData({
            ...formData,
            name: preset.name,
            price: preset.price.toString(),
            duration: preset.duration.toString(),
            durationType: preset.durationType,
            maxVenues: preset.maxVenues.toString(),
            maxCourts: preset.maxCourts.toString(),
        });
    };

    const groupedFeatures = availableFeatures.reduce((acc, feature) => {
        if (!acc[feature.category]) acc[feature.category] = [];
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, Feature[]>);

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                    {plan ? 'Edit Subscription Plan' : 'Create New Plan'}
                </h2>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Preset Plans */}
                    {!plan && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick Start with Preset
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {presetPlans.map((preset) => (
                                    <button
                                        key={preset.name}
                                        type="button"
                                        onClick={() => loadPreset(preset)}
                                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all text-left"
                                    >
                                        <div className="font-semibold text-gray-900">{preset.name}</div>
                                        <div className="text-sm text-blue-600 font-bold">₹{preset.price}/mo</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {preset.maxVenues}V • {preset.maxCourts}C
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Plan Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Plan Name"
                            type="text"
                            placeholder="e.g., Basic, Standard, Premium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                        />

                        <Input
                            label="Price (₹)"
                            type="number"
                            step="0.01"
                            placeholder="Monthly price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            error={errors.price}
                            icon={
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration *
                            </label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    duration: e.target.value,
                                    durationType: e.target.value === '30' ? 'monthly' : 'yearly'
                                })}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="30">Monthly (30 Days)</option>
                                <option value="365">Yearly (365 Days)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration Type
                            </label>
                            <input
                                type="text"
                                disabled
                                value={formData.durationType.toUpperCase()}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-100 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Limits */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-sm border-b pb-2">Plan Limits</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Max Venues"
                                type="number"
                                placeholder="Number of venues"
                                value={formData.maxVenues}
                                onChange={(e) => setFormData({ ...formData, maxVenues: e.target.value })}
                            />

                            <Input
                                label="Max Courts"
                                type="number"
                                placeholder="Courts per venue"
                                value={formData.maxCourts}
                                onChange={(e) => setFormData({ ...formData, maxCourts: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Input
                                    label="Max Bookings"
                                    type="number"
                                    placeholder="Total bookings"
                                    value={formData.maxBookings}
                                    disabled={formData.isUnlimitedBookings}
                                    onChange={(e) => setFormData({ ...formData, maxBookings: e.target.value })}
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="isUnlimitedBookings"
                                        checked={formData.isUnlimitedBookings}
                                        onChange={(e) => setFormData({ ...formData, isUnlimitedBookings: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <label htmlFor="isUnlimitedBookings" className="text-xs text-gray-600">
                                        Unlimited Bookings
                                    </label>
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="Max Messages"
                                    type="number"
                                    placeholder="Total messages"
                                    value={formData.maxMessages}
                                    disabled={formData.isUnlimitedMessages}
                                    onChange={(e) => setFormData({ ...formData, maxMessages: e.target.value })}
                                />
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="isUnlimitedMessages"
                                        checked={formData.isUnlimitedMessages}
                                        onChange={(e) => setFormData({ ...formData, isUnlimitedMessages: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <label htmlFor="isUnlimitedMessages" className="text-xs text-gray-600">
                                        Unlimited Messages
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Select */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-sm border-b pb-2 flex justify-between">
                            Unlocks Features
                        </h3>
                        {loadingFeatures ? (
                            <p className="text-sm text-gray-500 italic">Loading available features...</p>
                        ) : availableFeatures.length === 0 ? (
                            <p className="text-sm text-red-500">No active features found. Please add features in &quot;Plan Features&quot; first.</p>
                        ) : (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {Object.entries(groupedFeatures).map(([category, features]) => (
                                    <div key={category}>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">{category}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {features.map((feature) => {
                                                const isSelected = formData.selectedFeatureIds.includes(feature._id) || formData.selectedFeatureIds.includes(feature.name);
                                                return (
                                                    <label
                                                        key={feature._id}
                                                        className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={isSelected}
                                                            onChange={() => handleFeatureToggle(feature._id)}
                                                        />
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                                                            }`}>
                                                            {isSelected && (
                                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                            {feature.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                            Plan is active and available for purchase
                        </label>
                    </div>

                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isLoading}
                        >
                            {plan ? 'Update Plan' : 'Create Plan'}
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
