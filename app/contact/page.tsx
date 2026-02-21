'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api-config';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(getApiUrl('contact'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thank you! Your message has been sent successfully to oneverce1011@gmail.com.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                alert(data.message || 'Error sending message. Please try again.');
            }
        } catch (err: unknown) {
            console.error('Error:', err);
            alert('Failed to send message. Please check if the server is running.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                                    Get in <span className="text-blue-600">Touch</span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                                    Have questions about booking a venue or listing your own? Our team is here to help you 24/7.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    {
                                        title: 'Our Office',
                                        content: 'Kalol,Gandhinagar,Gujarat 382721',
                                        icon: (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )
                                    },
                                    {
                                        title: 'Email Us',
                                        content: 'oneverce1011@gmail.com',
                                        icon: (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        )
                                    },
                                    {
                                        title: 'Call Us',
                                        content: '+91 8401286822 , mon-sat 9am - 6pm',
                                        icon: (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        )
                                    }
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">{item.title}</h4>
                                            <p className="text-gray-600 leading-relaxed font-medium">{item.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="pt-8 space-y-4">
                                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Follow Us</h4>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm">
                                            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <Card className="border-none shadow-2xl shadow-blue-500/10 overflow-hidden backdrop-blur-md bg-white/90">
                            <CardBody className="p-8 md:p-12">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Your Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Subject</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-white font-medium"
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="booking">Booking Issue</option>
                                            <option value="owner">Venue Listing</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Your Message</label>
                                        <textarea
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                            placeholder="How can we help you today?"
                                        ></textarea>
                                    </div>
                                    <Button type="submit" size="lg" className="w-full py-4 shadow-xl shadow-blue-500/20">
                                        Send Message
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
