'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import { getApiUrl } from '@/lib/api-config';

export default function Home() {
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalBookings: 0,
    totalCities: 0,
    totalSports: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('venues/stats'));
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></span>
              <span className="text-sm font-medium text-blue-600">
                🎉 Now Live in {stats.totalCities}+ Cities
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Book Your Sports Slot
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              India&apos;s fastest growing sports booking platform. Find venues, book slots,
              and play your favorite sports instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/cities">
                <Button size="lg" className="min-w-[200px]">
                  Browse Venues
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/register?role=owner">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  List Your Venue
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              <div>
                <div className="text-4xl font-bold text-blue-600">{formatNumber(stats.totalVenues)}+</div>
                <div className="text-gray-600 mt-1">Venues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">{formatNumber(stats.totalBookings)}+</div>
                <div className="text-gray-600 mt-1">Bookings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">{formatNumber(stats.totalCities)}+</div>
                <div className="text-gray-600 mt-1">Cities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600">{formatNumber(stats.totalSports)}+</div>
                <div className="text-gray-600 mt-1">Sports</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Sports
            </h2>
            <p className="text-xl text-gray-600">
              Choose from a wide variety of sports
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              { name: 'Cricket', icon: '🏏', color: 'from-blue-500 to-blue-600' },
              { name: 'Football', icon: '⚽', color: 'from-green-500 to-green-600' },
              { name: 'Badminton', icon: '🏸', color: 'from-purple-500 to-purple-600' },
              { name: 'Tennis', icon: '🎾', color: 'from-yellow-500 to-yellow-600' },
              { name: 'Basketball', icon: '🏀', color: 'from-orange-500 to-orange-600' },
            ].map((sport) => (
              <Card key={sport.name} hover className="cursor-pointer">
                <CardBody className="text-center space-y-3">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${sport.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                    {sport.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{sport.name}</h3>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Book your slot in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Your Sport',
                description: 'Browse venues by city and select your favorite sport',
                icon: '🎯',
              },
              {
                step: '2',
                title: 'Select Time Slot',
                description: 'Pick a convenient time slot and make instant payment',
                icon: '⏰',
              },
              {
                step: '3',
                title: 'Play & Enjoy',
                description: 'Get instant confirmation and show up to play',
                icon: '🎉',
              },
            ].map((item) => (
              <Card key={item.step} gradient>
                <CardBody className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-5xl">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Sportivo?
            </h2>
            <p className="text-xl text-gray-400">
              The best platform for sports enthusiasts and venue owners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Instant Booking', description: 'Book slots in seconds with real-time availability' },
              { icon: '💳', title: 'Secure Payments', description: 'Safe and secure UPI-based payment system' },
              { icon: '📱', title: 'SMS Confirmation', description: 'Get instant booking confirmation via SMS/WhatsApp' },
              { icon: '🏆', title: 'Quality Venues', description: 'All venues are verified and quality-checked' },
              { icon: '💰', title: 'Best Prices', description: 'Transparent pricing with no hidden charges' },
              { icon: '🎯', title: 'Easy Management', description: 'Venue owners get powerful management tools' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-gray-800 hover:bg-gray-750 transition-colors">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardBody className="text-center space-y-6 p-12">
              <h2 className="text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100">
                Join thousands of sports enthusiasts and venue owners on Sportivo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="min-w-[200px] bg-white text-blue-600 hover:bg-gray-100">
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/cities">
                  <Button variant="outline" size="lg" className="min-w-[200px] border-white text-white hover:bg-white/10">
                    Browse Venues
                  </Button>
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
