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
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <h1 className="text-4xl font-bold text-white">Something went wrong!</h1>
                <p className="text-lg text-gray-400">
                    An error occurred while rendering this page.
                </p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
