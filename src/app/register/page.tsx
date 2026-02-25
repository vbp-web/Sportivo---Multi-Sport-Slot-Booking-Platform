'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api-config';

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'user' | 'owner'>('user');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Enter valid 10-digit phone number';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        // Owner specific validation
        if (role === 'owner') {
            if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
            if (!formData.venueName) newErrors.venueName = 'Venue name is required';
            if (!formData.city) newErrors.city = 'City is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(getApiUrl('auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    role,
                    ...(role === 'owner' && {
                        ownerDetails: {
                            ownerName: formData.ownerName,
                            venueName: formData.venueName,
                            city: formData.city,
                            sportsOffered: formData.sportsOffered ? formData.sportsOffered.split(',').map(s => s.trim()) : []
                        }
                    })
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Show success message
            alert(data.message || 'Registration successful! Please login.');

            // Redirect to login
            router.push('/login');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Sportivo
                    </span>
                </Link>

                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-gray-900 text-center">Create Account</h1>
                        <p className="text-gray-600 text-center mt-2">Join Sportivo today</p>
                    </CardHeader>

                    <CardBody className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                I want to register as
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'user', label: 'User', icon: '👤', desc: 'Book sports slots' },
                                    { value: 'owner', label: 'Venue Owner', icon: '🏢', desc: 'List your venue' },
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setRole(item.value as 'user' | 'owner')}
                                        className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${role === item.value
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="text-3xl mb-2">{item.icon}</div>
                                        <div className={`font-semibold ${role === item.value ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {item.label}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                label="Email Address *"
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

                            {errors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {errors.general}
                                </div>
                            )}

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

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="w-full">
                                Login
                            </Button>
                        </Link>
                    </CardBody>
                </Card>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
