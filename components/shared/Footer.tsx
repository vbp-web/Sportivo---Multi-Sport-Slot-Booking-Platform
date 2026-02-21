import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">
                                Sportivo
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Book sports slots instantly. Manage venues efficiently. Grow your sports business.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/cities" className="text-sm hover:text-blue-400 transition-colors">
                                    Browse Venues
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm hover:text-blue-400 transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm hover:text-blue-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Owners */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">For Venue Owners</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/register?role=owner" className="text-sm hover:text-blue-400 transition-colors">
                                    Register Your Venue
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm hover:text-blue-400 transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm hover:text-blue-400 transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-gray-400">
                            © 2026 Sportivo. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-400">
                            Designed by Oneverce
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
