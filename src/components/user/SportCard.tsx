import React from 'react';
import Card, { CardBody } from '../ui/Card';

interface SportCardProps {
    sport: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
        venueCount?: number;
    };
    onClick?: () => void;
}

export default function SportCard({ sport, onClick }: SportCardProps) {
    const sportIcons: { [key: string]: string } = {
        'Cricket': '🏏',
        'Football': '⚽',
        'Badminton': '🏸',
        'Tennis': '🎾',
        'Basketball': '🏀',
        'Volleyball': '🏐',
        'Table Tennis': '🏓',
        'Swimming': '🏊',
        'Gym': '💪',
        'Yoga': '🧘',
    };

    const icon = sport.icon || sportIcons[sport.name] || '🎯';

    return (
        <Card hover className="cursor-pointer h-full" onClick={onClick}>
            <CardBody className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform transition-transform hover:scale-110">
                    {icon}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                    {sport.name}
                </h3>

                {sport.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {sport.description}
                    </p>
                )}

                {sport.venueCount !== undefined && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{sport.venueCount} Venues</span>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
