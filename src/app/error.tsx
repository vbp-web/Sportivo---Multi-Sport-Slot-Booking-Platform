'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <h1 className="text-4xl font-bold text-gray-900">Something went wrong!</h1>
                <p className="text-lg text-gray-600">
                    An error occurred while rendering this page.
                </p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
