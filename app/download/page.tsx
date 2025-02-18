export default function Download() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B3B6F] to-[#065A82] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <h1 className="text-6xl font-extrabold mb-16 text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cloud-white to-golden-lamp">
            Calendar Genie
          </span>
          <span className="ml-4 inline-block">🧞‍♂️</span>
        </h1>

        {/* Download Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
          {/* iOS App Store Button */}
          <a
            href="https://apps.apple.com/app/id6740502295"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 relative min-w-[240px]"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4CC9F0] to-[#4895EF] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative flex items-center justify-center space-x-4 bg-cloud-white p-8 rounded-xl h-full hover:scale-105 transition duration-200">
              <span className="text-5xl">📱</span>
              <div className="text-left">
                <p className="text-sm text-genie-blue font-medium">Download on the</p>
                <p className="text-2xl text-midnight-navy font-bold">App Store</p>
              </div>
            </div>
          </a>

          {/* Chrome Web Store Button */}
          <a
            href="https://chromewebstore.google.com/detail/calendar-genie/mioobebakeadpohjilbedccbibpneajg"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 relative min-w-[240px]"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4CC9F0] to-[#4895EF] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative flex items-center justify-center space-x-4 bg-cloud-white p-8 rounded-xl h-full hover:scale-105 transition duration-200">
              <span className="text-5xl">🔮</span>
              <div className="text-left">
                <p className="text-sm text-genie-blue font-medium">Available in the</p>
                <p className="text-2xl text-midnight-navy font-bold">Chrome Store</p>
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-x-6">
          <a 
            href="/privacy" 
            className="text-cloud-white/80 hover:text-cloud-white text-sm underline decoration-dotted transition-colors duration-300"
          >
            Privacy Policy
          </a>
          <a 
            href="/contact" 
            className="text-cloud-white/80 hover:text-cloud-white text-sm underline decoration-dotted transition-colors duration-300"
          >
            Contact
          </a>
        </footer>
      </div>
    </main>
  );
} 