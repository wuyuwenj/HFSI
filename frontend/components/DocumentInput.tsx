'use client';

import React, { useState, useRef } from 'react';

interface DocumentInputProps {
  onAnalyze: (documents: string, pdfFiles?: File[], audioFiles?: File[], mode?: 'detailed' | 'bulk') => void;
}

interface UploadedFileRef {
  fileName: string;
  bucket: string;
  url: string;
}

type UploadMode = 'detailed' | 'bulk';

const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [documents, setDocuments] = useState('');
  const [uploadedPdfs, setUploadedPdfs] = useState<File[]>([]);
  const [uploadedAudios, setUploadedAudios] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>('detailed');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const uploadFileToStorage = async (file: File, type: 'pdf' | 'audio'): Promise<UploadedFileRef> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }

    return await response.json();
  };

  const handleAnalyzeClick = async () => {
    // Check file sizes first
    const totalSize = [...uploadedPdfs, ...uploadedAudios].reduce((sum, file) => sum + file.size, 0);
    const useLargeFileHandler = totalSize > 3 * 1024 * 1024; // 3MB threshold

    if (useLargeFileHandler) {
      // Use storage-based upload for large files
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const totalFiles = uploadedPdfs.length + uploadedAudios.length;
        let uploadedCount = 0;

        // Upload PDFs to storage
        const pdfRefs: UploadedFileRef[] = [];
        for (const pdf of uploadedPdfs) {
          const ref = await uploadFileToStorage(pdf, 'pdf');
          pdfRefs.push(ref);
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
        }

        // Upload audio files to storage
        const audioRefs: UploadedFileRef[] = [];
        for (const audio of uploadedAudios) {
          const ref = await uploadFileToStorage(audio, 'audio');
          audioRefs.push(ref);
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
        }

        setUploadProgress(100);

        // Call analyze-stored endpoint
        const response = await fetch('/api/analyze-stored', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documents,
            pdfPaths: pdfRefs.map(ref => ({ fileName: ref.fileName, bucket: ref.bucket })),
            audioPaths: audioRefs.map(ref => ({ fileName: ref.fileName, bucket: ref.bucket })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze case');
        }

        const result = await response.json();

        // Navigate to the analysis result
        window.location.href = `/analysis/${result.id}`;
      } catch (error) {
        console.error('Error uploading files:', error);
        alert('Failed to upload files. Please try again or use smaller files.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Use direct upload for smaller files (original method)
      if (uploadMode === 'bulk') {
        if (uploadedPdfs.length > 0) {
          onAnalyze('', uploadedPdfs, [], 'bulk');
        }
      } else {
        if (documents.trim() || uploadedPdfs.length > 0 || uploadedAudios.length > 0) {
          onAnalyze(documents, uploadedPdfs, uploadedAudios, 'detailed');
        }
      }
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

  // Clear all uploaded content when switching modes
  const handleModeChange = (mode: UploadMode) => {
    // Check if there's content that will be lost
    const hasContent = documents.trim() || uploadedPdfs.length > 0 || uploadedAudios.length > 0;

    // If switching mode and there's content, show confirmation
    if (hasContent && mode !== uploadMode) {
      const confirmSwitch = confirm(
        'Switching modes will clear all uploaded files and text. Do you want to continue?'
      );

      if (!confirmSwitch) {
        return; // Don't switch if user cancels
      }
    }

    setUploadMode(mode);
    // Clear all uploaded content when switching between modes
    setUploadedPdfs([]);
    setUploadedAudios([]);
    setDocuments('');

    // Reset file input refs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between mb-4">
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Evidex</h1>
          <p className="text-lg text-blue-300 mt-2">AI-Powered Judicial Decision Support</p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-slate-900 p-1">
          <button
            onClick={() => handleModeChange('detailed')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
              uploadMode === 'detailed'
                ? 'bg-brand-secondary text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Single Person Analysis</span>
              {uploadMode === 'detailed' && (documents.trim() || uploadedPdfs.length > 0 || uploadedAudios.length > 0) && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => handleModeChange('bulk')}
            className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
              uploadMode === 'bulk'
                ? 'bg-brand-secondary text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>Bulk Upload</span>
              {uploadMode === 'bulk' && uploadedPdfs.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  {uploadedPdfs.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Mode-specific Instructions */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          {uploadMode === 'detailed' ? (
            <div>
              <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Detailed Analysis Mode
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                Analyze <strong>one person's case</strong> in detail using any combination of:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-400 text-sm space-y-1">
                <li>Documents (PDF, DOCX, TXT)</li>
                <li>Audio recordings for transcription (MP3, WAV, M4A, etc.)</li>
                <li>Pasted text content from transcripts or reports</li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Bulk Upload Mode
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                Process <strong>multiple cases at once</strong>. The system will:
              </p>
              <ul className="list-disc list-inside ml-4 text-gray-400 text-sm space-y-1">
                <li>Automatically detect different people in your files</li>
                <li>Separate and organize files by person</li>
                <li>Analyze each case individually with progress tracking</li>
                <li>Recommended: Use document files only (PDF, DOCX, TXT)</li>
              </ul>
            </div>
          )}
        </div>

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

        {/* Uploaded Audio Files List - Only show in detailed mode */}
        {uploadMode === 'detailed' && uploadedAudios.length > 0 && (
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

        {uploadMode === 'detailed' && (
          <textarea
            className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-md text-gray-200 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 resize-none"
            placeholder="Paste witness statements, police reports, forensic analyses, etc. here... (optional if files or audio uploaded)"
            value={documents}
            onChange={(e) => setDocuments(e.target.value)}
          />
        )}
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
          <div className={`flex ${uploadMode === 'bulk' ? 'flex-col' : 'flex-col sm:flex-row'} gap-4`}>
            <button
              onClick={handleUploadButtonClick}
              className={`${uploadMode === 'bulk' ? 'w-full' : 'flex-1'} py-3 px-6 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 transition duration-200 flex items-center justify-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {uploadMode === 'bulk' ? 'Upload Documents (PDF, DOCX, TXT)' : 'Upload Documents'}
            </button>
            {uploadMode === 'detailed' && (
              <button
                onClick={handleAudioButtonClick}
                className="flex-1 py-3 px-6 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-500 transition duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Upload Audio
              </button>
            )}
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="bg-slate-700 p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Uploading files...</span>
                <span className="text-blue-300 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Please wait while we upload your files to secure storage...
              </p>
            </div>
          )}

          <button
            onClick={handleAnalyzeClick}
            disabled={
              isUploading || (
                uploadMode === 'detailed'
                  ? (!documents.trim() && uploadedPdfs.length === 0 && uploadedAudios.length === 0)
                  : (uploadedPdfs.length === 0)
              )
            }
            className="w-full py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm-1 5a1 1 0 000 2h10a1 1 0 100-2H6zm0 4a1 1 0 100 2h10a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {uploadMode === 'bulk'
                  ? uploadedPdfs.length > 0
                    ? `Analyze ${uploadedPdfs.length} File${uploadedPdfs.length > 1 ? 's' : ''}`
                    : 'Analyze All Cases'
                  : 'Analyze Case'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentInput;
