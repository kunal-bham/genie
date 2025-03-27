import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
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
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
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

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-gray-600">
                AI-powered suggestions for optimal meeting times based on your preferences and availability.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Easy Integration</h3>
              <p className="text-gray-600">
                Seamlessly connect with your existing calendar apps and tools.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Intelligent Reminders</h3>
              <p className="text-gray-600">
                Never miss important events with smart notifications and reminders.
              </p>
            </div>
          </div>
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