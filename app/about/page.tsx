'use client';

import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Link from 'next/link';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Revolutionizing Sports <br />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Booking Experience
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                        Sportivo is India's premier platform for sports enthusiasts to find, book, and enjoy their favorite sports venues instantly. Our mission is to make sports accessible to everyone.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/cities">
                            <Button size="lg">Explore Venues</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Your journey from screen to field in three simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Search & Discover',
                                description: 'Enter your city and browse through the best sports venues, from box cricket to football turfs.',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )
                            },
                            {
                                step: '02',
                                title: 'Choose & Pay',
                                description: 'Select your preferred time slot, upload your payment proof (UTR), and book your spot instantly.',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )
                            },
                            {
                                step: '03',
                                title: 'Play & Enjoy',
                                description: 'Once approved by the owner, you\'ll receive a confirmation. Show up at the venue and start playing!',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )
                            }
                        ].map((item) => (
                            <Card key={item.step} className="border-none bg-white/80 shadow-xl shadow-blue-500/5">
                                <CardBody className="p-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider">Step {item.step}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Mission */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                                Our Mission is to <br />
                                <span className="text-blue-600">Empower Athletes</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                At Sportivo, we believe that staying active shouldn't be a logistical challenge. We've built a platform that bridges the gap between passionate players and top-tier venue owners.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    { title: 'Easy Accessibility', desc: 'Find venues near you with just a few clicks.' },
                                    { title: 'Verified Owners', desc: 'We only partner with the most reliable venues.' },
                                    { title: 'Secure Transactions', desc: 'Transparent payment tracking with UTR validation.' },
                                    { title: '24/7 Support', desc: 'Our team is always here to help you get on the field.' }
                                ].map((feature) => (
                                    <div key={feature.title} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{feature.title}</h4>
                                            <p className="text-sm text-gray-600">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                                <div className="p-8 md:p-12 text-center space-y-6">
                                    <div className="text-6xl text-blue-600 font-bold italic tracking-tighter">"Play More, Wait Less."</div>
                                    <p className="text-gray-500 font-medium">— Our Founding Philosophy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gray-900 border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
                        <CardBody className="text-center space-y-8 p-12 relative z-10">
                            <h2 className="text-4xl font-bold text-white">Join the Community</h2>
                            <p className="text-xl text-gray-400">Whether you're a player or a venue owner, Sportivo is the place for you.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register">
                                    <Button size="lg" className="px-12 bg-white text-gray-900 hover:bg-gray-100">Sign Up</Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" size="lg" className="px-12 border-white text-white hover:bg-white/10">Contact Us</Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}
