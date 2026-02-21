'use client';

import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RoleSelector from './RoleSelector';

interface LoginFormProps {
    onSubmit: (data: { phone: string; password: string; role: string }) => Promise<void>;
    onForgotPassword?: () => void;
    allowedRoles?: Array<'user' | 'owner' | 'admin'>;
}

export default function LoginForm({
    onSubmit,
    onForgotPassword,
    allowedRoles = ['user', 'owner', 'admin']
}: LoginFormProps) {
    const [role, setRole] = useState<string>(allowedRoles[0]);
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { value: 'user', label: 'User', icon: '👤', description: 'Book slots' },
        { value: 'owner', label: 'Owner', icon: '🏢', description: 'Manage venue' },
        { value: 'admin', label: 'Admin', icon: '👨‍💼', description: 'Platform admin' },
    ].filter(r => allowedRoles.includes(r.value as 'user' | 'owner' | 'admin'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Enter valid 10-digit phone number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await onSubmit({ ...formData, role });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
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
                    onChange={setRole}
                />
            )}

            {/* Phone Input */}
            <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                }
            />

            {/* Password Input */}
            <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                }
            />

            {/* Forgot Password Link */}
            {onForgotPassword && (
                <div className="text-right">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Forgot Password?
                    </button>
                </div>
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
                Login
            </Button>
        </form>
    );
}
