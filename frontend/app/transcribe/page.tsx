'use client';

import React, { useState, useRef } from 'react';
import { TranscriptionEntry } from '@/types';

const TranscribePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionEntry[]>([]);
  const [formattedText, setFormattedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({});
  const [isEditingNames, setIsEditingNames] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setTranscription([]);
      setFormattedText('');
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audioFile', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscription(data.entries);
      setFormattedText(data.formattedTranscript);

      // Initialize speaker names mapping with detected speakers
      const uniqueSpeakers = Array.from(new Set(data.entries.map((e: TranscriptionEntry) => e.speaker))) as string[];
      const initialNames: Record<string, string> = {};
      uniqueSpeakers.forEach((speaker: string) => {
        initialNames[speaker] = speaker; // Default to original speaker label
      });
      setSpeakerNames(initialNames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakerNameChange = (originalSpeaker: string, newName: string) => {
    setSpeakerNames(prev => ({
      ...prev,
      [originalSpeaker]: newName || originalSpeaker
    }));
  };

  const getUpdatedTranscript = (): string => {
    let updatedText = formattedText;

    // Replace each speaker label with the custom name
    Object.entries(speakerNames).forEach(([original, custom]) => {
      if (custom && custom !== original) {
        // Replace "Speaker X:" with "Custom Name:"
        const regex = new RegExp(`${original}:`, 'g');
        updatedText = updatedText.replace(regex, `${custom}:`);
      }
    });

    return updatedText;
  };

  const getDisplaySpeaker = (speaker: string): string => {
    return speakerNames[speaker] || speaker;
  };

  const getSpeakerColor = (speaker: string): string => {
    const colors = [
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-purple-400',
      'text-pink-400',
      'text-indigo-400',
    ];
    const speakerIndex = Array.from(new Set(transcription.map(t => t.speaker))).indexOf(speaker);
    return colors[speakerIndex % colors.length];
  };

  return (
    <div className="min-h-screen bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </a>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Audio Transcription</h1>
          <p className="text-gray-400 mb-6">Upload an audio file to transcribe with speaker identification</p>

          {/* File Upload Section */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,audio/ogg,.mp3,.wav,.m4a,.webm,.ogg"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
              {file ? (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M5 12h14M5 16h2m10 0h2" />
                  </svg>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-200"
                  >
                    Select Audio File
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    Supported: MP3, WAV, M4A, WEBM, OGG (max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Transcribe Button */}
          <button
            onClick={handleTranscribe}
            disabled={!file || isLoading}
            className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Transcribing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Transcribe Audio
              </>
            )}
          </button>

          {/* Transcription Results */}
          {transcription.length > 0 && (
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Transcription Results</h2>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Speakers Identified</p>
                    <p className="text-2xl font-bold text-white">
                      {new Set(transcription.map(t => t.speaker)).size}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Segments</p>
                    <p className="text-2xl font-bold text-white">{transcription.length}</p>
                  </div>
                </div>

                {/* Speaker Names Editor */}
                <div className="mb-6 bg-slate-700 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Speaker Names</h3>
                    <button
                      onClick={() => setIsEditingNames(!isEditingNames)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition duration-200 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      {isEditingNames ? 'Done' : 'Edit Names'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(speakerNames).map(([original, custom]) => (
                      <div key={original} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <span className={`font-semibold ${getSpeakerColor(original)}`}>
                            {original}
                          </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {isEditingNames ? (
                          <input
                            type="text"
                            value={custom}
                            onChange={(e) => handleSpeakerNameChange(original, e.target.value)}
                            placeholder={original}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          />
                        ) : (
                          <span className="flex-1 px-3 py-2 bg-slate-800 rounded-md text-white">
                            {custom}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {isEditingNames && (
                    <p className="mt-3 text-sm text-gray-400">
                      💡 Tip: Enter custom names for each speaker. The transcript will be updated when you download it.
                    </p>
                  )}
                </div>

                {/* Transcript Display */}
                <div className="bg-slate-900 rounded-lg p-6 max-h-96 overflow-y-auto">
                  {transcription.map((entry, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 font-mono pt-1">
                          {entry.timestamp}
                        </span>
                        <div className="flex-1">
                          <span className={`font-semibold ${getSpeakerColor(entry.speaker)}`}>
                            {getDisplaySpeaker(entry.speaker)}:
                          </span>
                          <p className="text-gray-300 mt-1">{entry.dialogue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    const updatedTranscript = getUpdatedTranscript();
                    const blob = new Blob([updatedTranscript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `transcript_${file?.name?.replace(/\.[^/.]+$/, '')}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-500 transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Transcript
                  {Object.values(speakerNames).some((name, i) => name !== Object.keys(speakerNames)[i]) && (
                    <span className="ml-2 px-2 py-0.5 bg-green-700 text-white text-xs rounded-full">
                      with custom names
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscribePage;