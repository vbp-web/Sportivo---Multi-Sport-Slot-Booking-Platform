'use client';

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RoleSelector from './RoleSelector';

interface RegisterFormData {
    name: string;
    phone: string;
    email?: string;
    password: string;
    confirmPassword: string;
    role: string;
    // Owner specific
    ownerName?: string;
    venueName?: string;
    city?: string;
    sportsOffered?: string;
}

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => Promise<void>;
    allowedRoles?: Array<'user' | 'owner'>;
}

export default function RegisterForm({
    onSubmit,
    allowedRoles = ['user', 'owner']
}: RegisterFormProps) {
    const [role, setRole] = useState<'user' | 'owner'>(allowedRoles[0]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Owner specific
        ownerName: '',
        venueName: '',
        city: '',
        sportsOffered: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { value: 'user', label: 'User', icon: '👤', description: 'Book sports slots' },
        { value: 'owner', label: 'Venue Owner', icon: '🏢', description: 'List your venue' },
    ].filter(r => allowedRoles.includes(r.value as 'user' | 'owner'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Enter valid 10-digit phone number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Owner specific validation
        if (role === 'owner') {
            if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
            if (!formData.venueName.trim()) newErrors.venueName = 'Venue name is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit({ ...formData, role });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            {allowedRoles.length > 1 && (
                <RoleSelector
                    roles={roles}
                    selectedRole={role}
                    onChange={(r) => setRole(r as 'user' | 'owner')}
                    layout="vertical"
                />
            )}

            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                />

                <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                />
            </div>

            <Input
                label="Email (Optional)"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
            />

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    label="Password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                />
            </div>

            {/* Owner Specific Fields */}
            {role === 'owner' && (
                <>
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Details</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Owner Name"
                            type="text"
                            placeholder="Your name"
                            value={formData.ownerName}
                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            error={errors.ownerName}
                        />

                        <Input
                            label="Venue Name"
                            type="text"
                            placeholder="Your venue name"
                            value={formData.venueName}
                            onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                            error={errors.venueName}
                        />
                    </div>

                    <Input
                        label="City"
                        type="text"
                        placeholder="City where venue is located"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        error={errors.city}
                    />

                    <Input
                        label="Sports Offered (Optional)"
                        type="text"
                        placeholder="e.g., Cricket, Football, Badminton"
                        value={formData.sportsOffered}
                        onChange={(e) => setFormData({ ...formData, sportsOffered: e.target.value })}
                    />

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Your account will be pending admin approval.
                            You&apos;ll receive a notification once approved.
                        </p>
                    </div>
                </>
            )}

            {/* Error Message */}
            {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {errors.general}
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
            >
                Create Account
            </Button>
        </form>
    );
}
