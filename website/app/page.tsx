'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL!, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/CalendarGenie.png"
              alt="Calendar Genie Logo"
              width={32}
              height={32}
            />
            <span className="font-semibold text-lg">Calendar Genie</span>
          </div>
          <div className="flex items-center space-x-6">
            {/* <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">
              About
            </Link> */}
            <Link
              href="#download"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Download
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Calendar Genie
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Instantly convert screenshots into calendar events.
          </p>
          
          {/* Stats Blocks */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-w-[250px] cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-3">1,000+</div>
              <div className="text-lg text-gray-600">Active Users</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-w-[250px] cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary mb-3">10,000+</div>
              <div className="text-lg text-gray-600">Events Generated</div>
            </div>
          </div>

          {/* Try Button */}
          <div className="mb-8">
            <button className="bg-primary text-white px-12 py-4 rounded-lg text-xl font-medium hover:bg-primary/90 transition-colors">
              Try Calendar Genie
            </button>
          </div>

          {/* Availability */}
          <div className="flex justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>iOS App</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Chrome Extension</span>
            </div>
          </div>
        </div>
      </section>

      {/* Text and Video Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Description */}
            <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold mb-6 max-w-2xl text-left">Snap a photo, upload it to Calendar Genie, and it's instantly on your calendar.</h2>
              {/* <div className="space-y-6 text-gray-600 text-lg">
                <p>
                  Calendar Genie is your AI-powered assistant that instantly converts screenshots into calendar events. 
                  Whether it's a meeting invitation, event flyer, or any other time-based information, simply take a screenshot 
                  and let Calendar Genie do the rest.
                </p>
                <p>
                  Our intelligent system automatically extracts event details, dates, and times, creating perfectly formatted 
                  calendar entries in seconds. No more manual data entry or copy-pasting - just snap and schedule!
                </p>
              </div> */}
            </div>

            {/* Video */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                controls
                muted
                playsInline
                src="/ChromeExtension.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Calendar Genie?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Saves Time</h3>
              <p className="text-gray-600 leading-relaxed">
                No more manual input required. Just snap a photo and let Calendar Genie do the work.
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Works with Any Format</h3>
              <p className="text-gray-600 leading-relaxed">
                Handles fliers, emails, social media screenshots, and more. No matter the source, we've got you covered.
              </p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Available as a Share Extension and Chrome Extension for seamless integration into your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Join the community</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Join our mailing list to get notified about new features and updates.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="mt-4 text-green-600">Thanks for subscribing!</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-600">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Calendar Genie. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
} 