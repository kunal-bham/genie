export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B3B6F] to-[#065A82] py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-[#1a73e8] mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: January 14, 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
          <p className="text-gray-600 leading-relaxed">
            Calendar Genie ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application (the "App").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Image Data</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>We process screenshots and images that you explicitly share with the App</li>
              <li>Images are temporarily processed to extract event details</li>
              <li>Images are not stored permanently and are deleted after processing</li>
              <li>Image processing is performed using OpenAI's API with secure transmission</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Calendar Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Event details extracted from images</li>
              <li>Calendar access permissions for adding events to Google Calendar</li>
              <li>We don't read or collect existing calendar events</li>
              <li>Event creation is user-initiated and controlled</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Technical Data</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Device information required for app functionality</li>
              <li>Operating system version</li>
              <li>App crash reports and performance data</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">3.1 Image Processing</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To extract event details using AI technology</li>
              <li>To create calendar events based on extracted information</li>
              <li>Images are processed securely and immediately discarded</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">3.2 Calendar Integration</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To add user-approved events to Google Calendar</li>
              <li>To manage event creation and scheduling</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Sharing and Disclosure</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">4.1 Third-Party Services</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>OpenAI: For image processing and text extraction</li>
              <li>Google Calendar: For event creation and management</li>
              <li>These services are subject to their own privacy policies</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">4.2 We Do Not:</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Sell your personal information</li>
              <li>Share your data with advertisers</li>
              <li>Store your images or screenshots</li>
              <li>Track your calendar usage</li>
              <li>Collect information about existing calendar events</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>All data transmission is encrypted using industry-standard protocols</li>
            <li>App Group sharing is secured using iOS security features</li>
            <li>Temporary data is stored locally and protected by iOS security</li>
            <li>No user authentication data is stored locally</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
          <p className="text-gray-600 mb-3">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Control calendar permissions</li>
            <li>Control photo library access</li>
            <li>Delete app data by uninstalling the app</li>
            <li>Request information about your data usage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Children's Privacy</h2>
          <p className="text-gray-600">
            The App does not knowingly collect information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy periodically. Users will be notified of significant changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Contact Us</h2>
          <p className="text-gray-600">
            For privacy-related questions, contact us at:<br />
            kunal.bham@vanderbilt.edu
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Compliance</h2>
          <p className="text-gray-600 mb-3">This App complies with:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Apple's App Store Guidelines</li>
            <li>Google Calendar API Terms of Service</li>
            <li>OpenAI API Terms of Service</li>
            <li>App Store Privacy Guidelines</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">11. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Images: Deleted immediately after processing</li>
            <li>Event Details: Stored only until added to calendar</li>
            <li>Technical Logs: Retained for 30 days for debugging</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">12. Your Choices</h2>
          <p className="text-gray-600 mb-3">You can:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Choose which images to share</li>
            <li>Review extracted event details before saving</li>
            <li>Control calendar access permissions</li>
            <li>Opt out of crash reporting</li>
          </ul>
        </section>

        <p className="text-gray-600 italic text-center mt-8">
          By using Calendar Genie, you agree to this Privacy Policy and our handling of your data as described above.
        </p>
      </div>
    </main>
  );
} 