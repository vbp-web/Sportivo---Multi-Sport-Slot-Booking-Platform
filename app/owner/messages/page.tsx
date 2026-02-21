'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Sidebar from '@/components/shared/Sidebar';

interface Customer {
    _id: string;
    name: string;
    phone: string;
    email?: string;
}

export default function OwnerMessagesPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [messageType, setMessageType] = useState<'sms' | 'whatsapp'>('sms');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/owner/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Extract unique customers from bookings
                const uniqueCustomers = new Map();
                data.data?.forEach((booking: any) => {
                    if (booking.userId && typeof booking.userId === 'object') {
                        uniqueCustomers.set(booking.userId._id || booking.userId.id, {
                            _id: booking.userId._id || booking.userId.id,
                            name: booking.userId.name,
                            phone: booking.userId.phone,
                            email: booking.userId.email
                        });
                    }
                });
                setCustomers(Array.from(uniqueCustomers.values()));
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomer = (customerId: string) => {
        setSelectedCustomers(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const selectAll = () => {
        setSelectedCustomers(customers.map(c => c._id));
    };

    const deselectAll = () => {
        setSelectedCustomers([]);
    };

    const sendMessages = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        if (selectedCustomers.length === 0) {
            alert('Please select at least one customer');
            return;
        }

        setSending(true);

        try {
            // This is a placeholder - you'll need to implement the actual API endpoint
            const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c._id));

            console.log('Sending message:', {
                type: messageType,
                message,
                customers: selectedCustomerData
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert(`${messageType.toUpperCase()} messages sent successfully to ${selectedCustomers.length} customer(s)!`);
            setMessage('');
            setSelectedCustomers([]);
        } catch (error) {
            console.error('Error sending messages:', error);
            alert('Failed to send messages. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleMessageTypeChange = (type: 'sms' | 'whatsapp') => {
        if (type === 'whatsapp') {
            setShowComingSoonModal(true);
        } else {
            setMessageType(type);
        }
    };

    const quickMessages = [
        'Thank you for booking with us! We look forward to seeing you.',
        'Your booking has been confirmed. See you soon!',
        'Special offer: Book your next slot and get 10% off!',
        'Reminder: Your booking is tomorrow. Looking forward to seeing you!',
        'We hope you enjoyed your game! Please book again soon.',
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar role="owner" />

                <main className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            💬 Send Messages
                        </h1>
                        <p className="text-lg text-gray-600">
                            Send SMS or WhatsApp messages to your customers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Customer List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Customers ({customers.length})
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAll}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-3">
                                    Selected: {selectedCustomers.length} / {customers.length}
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {customers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No customers found</p>
                                            <p className="text-sm mt-1">Customers will appear here after they make bookings</p>
                                        </div>
                                    ) : (
                                        customers.map((customer) => (
                                            <label
                                                key={customer._id}
                                                className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(customer._id)}
                                                    onChange={() => toggleCustomer(customer._id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-sm text-gray-600">{customer.phone}</div>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Message Composer */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Compose Message</h2>

                                {/* Message Type Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Type
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer relative">
                                            <input
                                                type="radio"
                                                name="messageType"
                                                value="whatsapp"
                                                checked={messageType === 'whatsapp'}
                                                onChange={(e) => handleMessageTypeChange(e.target.value as 'whatsapp')}
                                                className="w-4 h-4 text-green-600"
                                            />
                                            <span className="flex items-center gap-2">
                                                <span className="text-2xl">📱</span>
                                                <span className="font-medium">WhatsApp</span>
                                                <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                                                    Coming Soon
                                                </span>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="messageType"
                                                value="sms"
                                                checked={messageType === 'sms'}
                                                onChange={(e) => handleMessageTypeChange(e.target.value as 'sms')}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="flex items-center gap-2">
                                                <span className="text-2xl">💬</span>
                                                <span className="font-medium">SMS</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Quick Messages */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quick Messages
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {quickMessages.map((qm, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setMessage(qm)}
                                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                            >
                                                {qm.substring(0, 30)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                        placeholder="Type your message here..."
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        {message.length} characters
                                    </div>
                                </div>

                                {/* Send Button */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={sendMessages}
                                        disabled={sending || selectedCustomers.length === 0 || !message.trim()}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {sending ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Send {messageType.toUpperCase()} to {selectedCustomers.length} customer(s)
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Info Box */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex gap-2">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Note:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Messages will be sent to selected customers only</li>
                                                <li>WhatsApp requires WhatsApp Business API setup</li>
                                                <li>SMS charges may apply based on your plan</li>
                                                <li>Keep messages professional and relevant</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />

            {/* Coming Soon Modal */}
            {showComingSoonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowComingSoonModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-5xl">📱</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                WhatsApp Integration
                            </h3>
                            <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold text-sm mb-4">
                                Coming Soon! 🚀
                            </div>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                We're working hard to bring you WhatsApp messaging capabilities.
                                This feature will allow you to send messages directly to your customers via WhatsApp.
                            </p>
                            <p className="text-gray-600 mb-6">
                                In the meantime, you can use <strong className="text-blue-600">SMS</strong> to communicate with your customers.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowComingSoonModal(false);
                                        setMessageType('sms');
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Use SMS Instead
                                </button>
                                <button
                                    onClick={() => setShowComingSoonModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                                >
                                    Got It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
