"use client"
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";

export default function Home() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const tzid = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tzid);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedFiles(prevFiles => [...prevFiles, ...imageFiles]);
    setErrorMessage(""); // Clear error message when new files are uploaded
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    
    console.log('🎯 Starting submission with:', {
      numberOfFiles: uploadedFiles.length,
      timezone: timezone
    });

    if (uploadedFiles.length === 0) {
      alert("Please upload at least one screenshot.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append(`file`, file);
    });
    formData.append('timezone', timezone);

    try {
      console.log('📤 Sending files to API...');
      const response = await fetch('/api/process-screenshots', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('📥 Received API response:', data);

      if (response.ok && data.success) {
        if (data.result.links.length === 0) {
          console.log('⚠️ No events found in images');
          setErrorMessage("Looks like there wasn't an event found, try again");
          setUploadedFiles([]);
        } else {
          console.log('✅ Successfully processed events:', {
            numberOfLinks: data.result.links.length,
            links: data.result.links
          });
          setResults(data.result.links);
        }
      } else {
        throw new Error(data.error || 'Failed to process screenshots');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setErrorMessage('An error occurred while processing your screenshots. Please try again.');
      setUploadedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractEventName = (link: string) => {
    const url = new URL(link);
    const text = url.searchParams.get('text');
    return text ? decodeURIComponent(text.replace(/\+/g, ' ')) : 'Unnamed Event';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1B3B6F] to-[#065A82] animate-gradient-xy py-16 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-6xl font-extrabold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cloud-white to-golden-lamp">
            Calendar Genie
          </span>
          <span className="ml-4 animate-bounce inline-block">🧞‍♂️</span>
        </h1>
        <p className="text-cloud-white text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform your event screenshots into calendar magic! ✨
          <br />
          <span className="font-medium text-golden-lamp">No more manual calendar entries.</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {results.length === 0 ? (
          <div className="transform hover:scale-102 transition-all duration-300">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
              <div className="bg-cloud-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-extrabold text-midnight-navy mb-8 text-center">
                  Your wish is my command 🎭
                </h2>
                
                {/* Upload Area */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-genie-blue to-golden-lamp p-1 transition-all duration-300 ease-in-out ${isLoading ? "cursor-not-allowed opacity-75" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    id="imageUpload"
                    onChange={handleChange}
                    multiple
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="imageUpload"
                    className={`flex flex-col items-center justify-center w-full h-full bg-cloud-white rounded-3xl p-12 ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-genie-blue to-golden-lamp rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <span className="text-5xl">🗓️</span>
                    </div>
                    <span className="text-midnight-navy text-xl font-bold text-center mb-2">
                      {dragActive ? "Release to Upload! ✨" : "Drop Screenshots Here"}
                    </span>
                    <span className="text-genie-blue text-sm">
                      or click to browse
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col items-center mt-8">
                  <button
                    type="submit"
                    className={`group bg-gradient-to-r from-[#4CC9F0] to-[#4895EF] text-white font-bold py-4 px-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    disabled={uploadedFiles.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Summoning Calendar Magic... ✨</span>
                      </>
                    ) : (
                      <>
                        <span className="group-hover:scale-110 transition-transform duration-300">Grant My Wish! 🧞‍♂️</span>
                      </>
                    )}
                  </button>
                  {errorMessage && (
                    <p className="mt-4 text-red-500 text-sm bg-red-100 px-4 py-2 rounded-full">
                      {errorMessage}
                    </p>
                  )}
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8 bg-twilight-gray/20 p-6 rounded-2xl backdrop-blur-sm">
                    <h3 className="font-bold mb-4 text-midnight-navy text-lg flex items-center">
                      <span className="mr-2">📸</span> Your Screenshots
                    </h3>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex items-center bg-cloud-white/90 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                          <span className="text-xl mr-3">🖼️</span>
                          <span className="text-midnight-navy font-medium text-sm truncate">
                            {file.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-genie-blue mt-6 text-center italic">
                  Your data vanishes like magic — we don't store anything! 🪄
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-genie-blue to-golden-lamp p-1 rounded-3xl shadow-2xl">
              <div className="bg-cloud-white/95 p-8 rounded-3xl">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-extrabold text-midnight-navy mb-4">
                    Your Wishes Are Granted! ✨
                  </h3>
                  <p className="text-genie-blue text-lg">
                    Click each event below to add it to your calendar
                  </p>
                </div>

                <ul className="space-y-4">
                  {results.map((link, index) => (
                    <li key={index} className="text-center">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-twilight-gray/10 hover:bg-golden-lamp/20 p-4 rounded-xl transition-all duration-300 text-midnight-navy font-medium hover:shadow-lg"
                      >
                        {extractEventName(link)} 📅
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      setUploadedFiles([]);
                      setResults([]);
                      setIsLoading(false);
                      setErrorMessage("");
                    }}
                    className="bg-gradient-to-r from-[#4CC9F0] to-[#4895EF] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Make Another Wish 🌟
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </main>
  );
}
