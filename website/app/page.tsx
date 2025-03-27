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
          <h1 className="text-5xl font-bold mb-6">
            Your Personal Calendar Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Calendar Genie helps you manage your schedule effortlessly with AI-powered suggestions and smart organization.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#download"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="#learn-more"
              className="border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50"
            >
              Learn More
            </Link>
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