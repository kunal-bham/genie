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

  // Main form component
  const UploadForm = () => {
    const FileUploadArea = () => (
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-genie-blue to-golden-lamp p-1 transition-all duration-300 ease-in-out ${isLoading ? "cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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
          className={`flex flex-col items-center justify-center w-full h-full bg-cloud-white rounded-3xl p-8 ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="w-24 h-24 bg-genie-blue rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl">🗓️</span>
          </div>
          <span className="text-midnight-navy text-xl font-bold text-center">
            {dragActive ? "Drop it like it's hot! 🔥" : "Click or drag images here"}
          </span>
        </label>
      </div>
    );

    const SubmitButton = () => (
      <div className="flex flex-col items-center">
        <button
          type="submit"
          className={`mt-8 bg-golden-lamp text-midnight-navy font-bold py-3 px-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl ${uploadedFiles.length === 0 || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={uploadedFiles.length === 0 || isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          <span className="text-lg">{isLoading ? "Genie's Brewing Magic ✨" : "Grant My Calendar Wish, Genie! 🧞‍♂️🗓️"}</span>
        </button>
        {errorMessage && (
          <p className="mt-4 text-red-500 text-xs text-center">{errorMessage}</p>
        )}
      </div>
    );

    const UploadedFilesList = () => (
      <div className="mt-6 bg-twilight-gray p-4 rounded-2xl shadow-inner shadow-md">
        <h3 className="font-bold mb-3 text-midnight-navy text-lg">Your Wishes:</h3>
        <ul className="space-y-1">
          {uploadedFiles.map((file, index) => (
            <li key={index} className="flex items-center bg-cloud-white p-2 rounded-md shadow-sm">
              <span className="text-xl mr-2">🖼️</span>
              <span className="text-midnight-navy font-medium text-sm truncate">{file.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="bg-cloud-white p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-extrabold text-midnight-navy mb-6 text-center">Your wish is our command — upload your screenshots</h2>
          <FileUploadArea />
          <SubmitButton />
          {uploadedFiles.length > 0 && <UploadedFilesList />}
          <p className="text-xs text-genie-blue mt-4 text-center italic">
            We respect your privacy and don't store any data. Poof! 💨
          </p>
        </div>
      </form>
    );
  };

  const ResultsList = () => {
    const extractEventName = (link: string) => {
      const url = new URL(link);
      const text = url.searchParams.get('text');
      return text ? decodeURIComponent(text.replace(/\+/g, ' ')) : 'Unnamed Event';
    };

    return (
      <div className="w-full max-w-2xl mt-12">
        <div className="bg-gradient-to-br from-genie-blue to-golden-lamp p-1 rounded-3xl shadow-2xl">
          <div className="bg-cloud-white p-8 rounded-3xl flex flex-col items-center">
            <h3 className="text-2xl font-extrabold mb-6 text-midnight-navy text-center">Your Wishes Have Been Granted! 🧞‍♂️✨🗓️</h3>
            <p className="w-2/3 text-lg text-midnight-navy mb-4 text-center">Click on each event below to open a new window and add it to your Google Calendar!</p>
            <ul className="space-y-4 w-full">
              {results.map((link, index) => (
                <li key={index} className="text-center">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-genie-blue hover:text-golden-lamp transition-colors duration-300 font-medium inline-block"
                  >
                    ➡️ {extractEventName(link)}
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
                className="bg-gradient-to-r from-golden-lamp to-golden-lamp text-midnight-navy font-bold py-3 px-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:brightness-110"
              >
                <span className="text-lg">Upload More 📤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center min-h-screen py-16 px-4 relative z-10">
      <h1 className="text-5xl font-extrabold text-cloud-white mb-8 text-center">
        <span className="bg-clip-text text-transparent bg-genie-blue">
          Google Calendar Genie
        </span>
        <span className="text-cloud-white ml-2">🧞‍♂️📅</span>
      </h1>
      <div className="text-base text-midnight-navy mb-8 text-center max-w-2xl space-y-3">
        <p>
          Tired of searching for calendar links or dealing with .ics files? 😠
        </p>
        <p className="font-semibold text-lg">
          Upload your event details screenshot, and with a single wish, the Genie will create Google Calendar links that instantly add the event to your calendar—no sign-in required! 🧞‍♂️💫
        </p>
      </div>
      {results.length === 0 ? <UploadForm /> : <ResultsList />}
      <div className="absolute bottom-8 right-8 text-xs text-midnight-navy opacity-70">
        <a href="https://x.com/joshpeters_" target="_blank" rel="noopener noreferrer" className="hover:underline">
          App by Josh Peters
        </a>
      </div>
    </main>
  );
}
