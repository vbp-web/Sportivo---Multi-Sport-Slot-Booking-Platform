'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import StaggerGrid, { StaggerItem } from '@/components/ui/StaggerGrid';
import CountUpNumber from '@/components/ui/CountUpNumber';
import ScrollProgress from '@/components/ui/ScrollProgress';
import TiltCard from '@/components/ui/TiltCard';
import TypeWriter from '@/components/ui/TypeWriter';
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

  // Phase 3: Connecting line ref for How It Works
  const howItWorksRef = useRef(null);
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Phase 3: Scroll Progress Bar */}
      <ScrollProgress />

      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Phase 1: Floating Gradient Blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />

        {/* Floating Sport Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🏏', '⚽', '🏸', '🎾', '🏀'].map((emoji, i) => (
            <span
              key={i}
              className="particle text-2xl opacity-0"
              style={{
                left: `${15 + i * 18}%`,
                top: `${60 + (i % 3) * 15}%`,
                animationDuration: `${6 + i * 2}s`,
                animationDelay: `${i * 1.5}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Phase 1: Staggered Fade-In Badge */}
            <div className="anim-fade-in-1">
              <div className="inline-flex items-center px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full badge-glow">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse mr-2.5" />
                <span className="text-sm font-medium text-indigo-300">
                  🎉 Now Live in {stats.totalCities}+ Cities
                </span>
              </div>
            </div>

            {/* Typewriter Heading with Colorful Shimmer */}
            <div className="anim-fade-in-2">
              <TypeWriter
                texts={[
                  { content: 'Book Your Sports Slot', className: 'text-white' },
                  { content: 'In Seconds', className: 'text-shimmer text-glow' },
                ]}
                speed={55}
                delayBetweenLines={300}
                cursorColor="#818cf8"
              />
            </div>

            {/* Phase 1: Staggered Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto anim-fade-in-3">
              India&apos;s fastest growing sports booking platform. Find venues, book slots,
              and play your favorite sports instantly.
            </p>

            {/* Phase 1: Staggered CTA Buttons with Shine */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center anim-fade-in-4">
              <Link href="/cities">
                <Button size="lg" className="min-w-[200px] btn-shine">
                  Browse Venues
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/register?role=owner">
                <Button variant="outline" size="lg" className="min-w-[200px] border-gray-600 text-gray-200 hover:bg-white/5">
                  List Your Venue
                </Button>
              </Link>
            </div>

            {/* Phase 2: Animated Count-Up Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 anim-fade-in-5">
              {[
                { label: 'Venues', value: stats.totalVenues, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
                { label: 'Bookings', value: stats.totalBookings, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
                { label: 'Cities', value: stats.totalCities, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
                { label: 'Sports', value: stats.totalSports, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] ${stat.glow}`}
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={`text-4xl font-bold ${stat.color}`}>
                    <CountUpNumber end={stat.value} suffix="+" />
                  </div>
                  <div className="text-gray-500 mt-1 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR SPORTS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle section divider glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
                Popular Sports
              </h2>
              <p className="text-xl text-gray-500">
                Choose from a wide variety of sports
              </p>
            </div>
          </ScrollReveal>

          {/* Phase 2: Staggered Grid + Phase 3: 3D Tilt Cards */}
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Cricket', icon: '🏏', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
              { name: 'Football', icon: '⚽', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
              { name: 'Badminton', icon: '🏸', color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
              { name: 'Tennis', icon: '🎾', color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
              { name: 'Basketball', icon: '🏀', color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
            ].map((sport) => (
              <StaggerItem key={sport.name}>
                <TiltCard
                  className={`sport-card bg-gray-900/60 border border-white/[0.06] rounded-2xl cursor-pointer ${sport.shadow}`}
                  tiltAmount={12}
                >
                  <div className="text-center space-y-4 p-6 py-8">
                    <div className={`sport-icon w-18 h-18 mx-auto bg-gradient-to-br ${sport.color} rounded-2xl flex items-center justify-center text-5xl shadow-lg p-4`}>
                      {sport.icon}
                    </div>
                    <h3 className="font-semibold text-gray-200 text-lg">{sport.name}</h3>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative" ref={howItWorksRef}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
                How It Works
              </h2>
              <p className="text-xl text-gray-500">
                Book your slot in 3 simple steps
              </p>
            </div>
          </ScrollReveal>

          {/* Phase 3: Steps with Connecting Lines */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines (desktop only) */}
            <div className="hidden md:block absolute top-[72px] left-[20%] right-[20%] h-[2px]">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={howItWorksInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            {[
              {
                step: '1',
                title: 'Choose Your Sport',
                description: 'Browse venues by city and select your favorite sport',
                icon: '🎯',
                delay: 0.2,
              },
              {
                step: '2',
                title: 'Select Time Slot',
                description: 'Pick a convenient time slot and make instant payment',
                icon: '⏰',
                delay: 0.4,
              },
              {
                step: '3',
                title: 'Play & Enjoy',
                description: 'Get instant confirmation and show up to play',
                icon: '🎉',
                delay: 0.6,
              },
            ].map((item) => (
              <ScrollReveal key={item.step} delay={item.delay}>
                <div className="glass-card rounded-2xl">
                  <div className="text-center space-y-5 p-8 relative z-10">
                    {/* Phase 3: Animated Step Number */}
                    <motion.div
                      className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 relative z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={howItWorksInView ? { scale: 1, rotate: 0 } : {}}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: item.delay + 0.3,
                      }}
                    >
                      {item.step}
                    </motion.div>
                    <div className="text-5xl">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-100">{item.title}</h3>
                    <p className="text-gray-500">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US (Glassmorphism) ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        {/* Background effects */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow">
                Why Choose Sportivo?
              </h2>
              <p className="text-xl text-gray-500">
                The best platform for sports enthusiasts and venue owners
              </p>
            </div>
          </ScrollReveal>

          {/* Phase 1: Glassmorphism + Phase 2: Stagger */}
          <StaggerGrid className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.12}>
            {[
              { icon: '⚡', title: 'Instant Booking', description: 'Book slots in seconds with real-time availability', accent: 'group-hover:shadow-yellow-500/20' },
              { icon: '💳', title: 'Secure Payments', description: 'Safe and secure UPI-based payment system', accent: 'group-hover:shadow-blue-500/20' },
              { icon: '📱', title: 'SMS Confirmation', description: 'Get instant booking confirmation via SMS/WhatsApp', accent: 'group-hover:shadow-green-500/20' },
              { icon: '🏆', title: 'Quality Venues', description: 'All venues are verified and quality-checked', accent: 'group-hover:shadow-amber-500/20' },
              { icon: '💰', title: 'Best Prices', description: 'Transparent pricing with no hidden charges', accent: 'group-hover:shadow-emerald-500/20' },
              { icon: '🎯', title: 'Easy Management', description: 'Venue owners get powerful management tools', accent: 'group-hover:shadow-purple-500/20' },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className={`glass-card rounded-2xl p-7 group ${feature.accent}`}>
                  <div className="feature-icon text-5xl mb-5 transition-transform duration-600">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-100 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <motion.div
              className="cta-gradient rounded-3xl relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

              {/* Floating small circles */}
              <motion.div
                className="absolute top-8 right-12 w-3 h-3 bg-white/30 rounded-full"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-12 left-16 w-2 h-2 bg-white/20 rounded-full"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/25 rounded-full"
                animate={{ x: [-8, 8, -8], y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="text-center space-y-7 p-12 md:p-16 relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
                  Join thousands of sports enthusiasts and venue owners on Sportivo
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/register">
                    <Button variant="secondary" size="lg" className="min-w-[200px] bg-gray-900/60 text-white hover:bg-white/5 btn-shine shadow-xl">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/cities">
                    <Button variant="outline" size="lg" className="min-w-[200px] border-white/40 text-white hover:bg-white/10">
                      Browse Venues
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
