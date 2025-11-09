'use client';

import React, { useState, useRef } from 'react';

interface DocumentInputProps {
  onAnalyze: (documents: string, pdfFiles?: File[], audioFiles?: File[]) => void;
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [documents, setDocuments] = useState('');
  const [uploadedPdfs, setUploadedPdfs] = useState<File[]>([]);
  const [uploadedAudios, setUploadedAudios] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeClick = () => {
    if (documents.trim() || uploadedPdfs.length > 0 || uploadedAudios.length > 0) {
      onAnalyze(documents, uploadedPdfs, uploadedAudios);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const acceptedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
    ];

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (acceptedTypes.includes(file.type)) {
        newFiles.push(file);
      } else {
        alert(`${file.name} is not a supported file type and will be skipped. Supported: PDF, DOCX, TXT`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedPdfs(prev => [...prev, ...newFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePdf = (index: number) => {
    setUploadedPdfs(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const acceptedAudioTypes = [
      'audio/mpeg', // .mp3
      'audio/wav', // .wav
      'audio/mp4', // .m4a
      'audio/x-m4a', // .m4a
      'audio/webm', // .webm
      'audio/ogg', // .ogg
    ];

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (acceptedAudioTypes.includes(file.type)) {
        newFiles.push(file);
      } else {
        alert(`${file.name} is not a supported audio file type. Supported: MP3, WAV, M4A, WEBM, OGG`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedAudios(prev => [...prev, ...newFiles]);
    }

    // Reset file input
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = (index: number) => {
    setUploadedAudios(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioButtonClick = () => {
    audioInputRef.current?.click();
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Overview
          </a>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">VeriJudex</h1>
          <p className="text-lg text-blue-300 mt-2">AI-Powered Judicial Decision Support</p>
        </div>
        <p className="text-gray-300 text-center">
          Paste case documents below, upload files (PDF, DOCX, TXT), or upload audio recordings (MP3, WAV, M4A, WEBM, OGG). VeriJudex will analyze the content to highlight inconsistencies, build timelines, and provide a comprehensive decision-making dashboard.
        </p>

        {/* Uploaded Files List */}
        {uploadedPdfs.length > 0 && (
          <div className="bg-slate-700 p-4 rounded-md">
            <h3 className="text-white font-semibold mb-2">Uploaded Documents ({uploadedPdfs.length})</h3>
            <div className="space-y-2">
              {uploadedPdfs.map((pdf, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                  <span className="text-gray-300 text-sm">{pdf.name}</span>
                  <button
                    onClick={() => handleRemovePdf(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Audio Files List */}
        {uploadedAudios.length > 0 && (
          <div className="bg-slate-700 p-4 rounded-md">
            <h3 className="text-white font-semibold mb-2">Uploaded Audio Files ({uploadedAudios.length})</h3>
            <div className="space-y-2">
              {uploadedAudios.map((audio, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                  <span className="text-gray-300 text-sm">{audio.name}</span>
                  <button
                    onClick={() => handleRemoveAudio(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-md text-gray-200 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 resize-none"
          placeholder="Paste witness statements, police reports, forensic analyses, etc. here... (optional if files or audio uploaded)"
          value={documents}
          onChange={(e) => setDocuments(e.target.value)}
        />
        <div className="flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx,.txt"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            type="file"
            ref={audioInputRef}
            accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,audio/ogg,.mp3,.wav,.m4a,.webm,.ogg"
            multiple
            onChange={handleAudioUpload}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUploadButtonClick}
              className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 transition duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Documents
            </button>
            <button
              onClick={handleAudioButtonClick}
              className="flex-1 py-3 px-6 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-500 transition duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Upload Audio
            </button>
          </div>
          <button
            onClick={handleAnalyzeClick}
            disabled={!documents.trim() && uploadedPdfs.length === 0 && uploadedAudios.length === 0}
            className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm-1 5a1 1 0 000 2h10a1 1 0 100-2H6zm0 4a1 1 0 100 2h10a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Analyze Documents
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentInput;
