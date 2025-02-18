export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B3B6F] to-[#065A82] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-light text-cloud-white mb-4">
          Kunal Bham
        </h1>
        <a 
          href="mailto:kunal.bham@vanderbilt.edu"
          className="text-cloud-white/80 hover:text-cloud-white text-lg transition-colors duration-300"
        >
          kunal.bham@vanderbilt.edu
        </a>
      </div>
    </main>
  );
} 