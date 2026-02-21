'use client';

import React from 'react';

interface RoleSelectorProps {
    roles: Array<{
        value: string;
        label: string;
        icon: string;
        description?: string;
    }>;
    selectedRole: string;
    onChange: (role: string) => void;
    layout?: 'horizontal' | 'vertical';
}

export default function RoleSelector({
    roles,
    selectedRole,
    onChange,
    layout = 'horizontal'
}: RoleSelectorProps) {
    const gridClass = layout === 'horizontal'
        ? `grid grid-cols-${roles.length} gap-3`
        : 'grid grid-cols-1 gap-3';

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
            </label>
            <div className={gridClass}>
                {roles.map((role) => (
                    <button
                        key={role.value}
                        type="button"
                        onClick={() => onChange(role.value)}
                        className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedRole === role.value
                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                    >
                        <div className={`text-3xl mb-2 ${layout === 'horizontal' ? 'text-center' : ''}`}>
                            {role.icon}
                        </div>
                        <div className={`font-semibold ${selectedRole === role.value ? 'text-blue-600' : 'text-gray-900'
                            } ${layout === 'horizontal' ? 'text-center' : ''}`}>
                            {role.label}
                        </div>
                        {role.description && (
                            <div className={`text-sm text-gray-500 mt-1 ${layout === 'horizontal' ? 'text-center' : ''}`}>
                                {role.description}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
