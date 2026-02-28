import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-400 border-t border-white/[0.06] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div className="space-y-5">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Sportivo
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Book sports slots instantly. Manage venues efficiently. Grow your sports business.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/cities" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    Browse Venues
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Owners */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">For Venue Owners</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/register?role=owner" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    Register Your Venue
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-400 transition-colors duration-300">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-14 pt-8 border-t border-white/[0.06]">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-gray-600">
                            © 2026 Sportivo. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-600">
                            Designed by <span className="text-gray-400 font-medium">Oneverce</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
