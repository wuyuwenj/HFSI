'use client';

import React, { useState, useRef, useEffect } from 'react';

// Declare global types for PDF.js loaded from CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface DocumentInputProps {
  onAnalyze: (documents: string) => void;
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [documents, setDocuments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load PDF.js from CDN using script tag
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
    script.type = 'module';

    script.onload = () => {
      // PDF.js is loaded as a module, we need to get it from the global scope
      // Wait a bit for the module to initialize
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
          setPdfLibLoaded(true);
        } else {
          // Try to initialize manually
          const initScript = document.createElement('script');
          initScript.type = 'module';
          initScript.textContent = `
            import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
            window.pdfjsLib = pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
            window.dispatchEvent(new Event('pdfjs-loaded'));
          `;
          document.head.appendChild(initScript);
        }
      }, 100);
    };

    const handlePdfJsLoaded = () => {
      setPdfLibLoaded(true);
    };

    window.addEventListener('pdfjs-loaded', handlePdfJsLoaded);
    document.head.appendChild(script);

    return () => {
      window.removeEventListener('pdfjs-loaded', handlePdfJsLoaded);
    };
  }, []);

  const handleAnalyzeClick = () => {
    if (documents.trim()) {
      onAnalyze(documents);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (!pdfLibLoaded || !window.pdfjsLib) {
      alert('PDF library is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Loading PDF...');

    try {
      const { createWorker } = await import('tesseract.js');

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setProcessingStatus('Initializing OCR...');
      const worker = await createWorker('eng');

      let fullText = '';

      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProcessingStatus(`Processing page ${pageNum} of ${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas to render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to image and run OCR
        const imageData = canvas.toDataURL('image/png');
        const { data: { text } } = await worker.recognize(imageData);

        fullText += `\n--- Page ${pageNum} ---\n${text}\n`;
      }

      await worker.terminate();

      // Append or set the extracted text to the textarea
      setDocuments(prevDocs => {
        if (prevDocs.trim()) {
          return prevDocs + '\n\n--- PDF Document: ' + file.name + ' ---' + fullText;
        }
        return '--- PDF Document: ' + file.name + ' ---' + fullText;
      });

      setProcessingStatus('');
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">VeriJudex</h1>
          <p className="text-lg text-blue-300 mt-2">AI-Powered Judicial Decision Support</p>
        </div>
        <p className="text-gray-300 text-center">
          Paste all relevant case documents below or upload a PDF file. VeriJudex will analyze the unstructured text to highlight inconsistencies, build timelines, and provide a comprehensive decision-making dashboard.
        </p>
        {processingStatus && (
          <div className="text-center text-blue-300 bg-slate-700 py-2 px-4 rounded-md">
            {processingStatus}
          </div>
        )}
        <textarea
          className="w-full h-80 p-4 bg-slate-900 border border-slate-700 rounded-md text-gray-200 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 resize-none"
          placeholder="Paste witness statements, police reports, forensic analyses, etc. here..."
          value={documents}
          onChange={(e) => setDocuments(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={handleUploadButtonClick}
            disabled={isProcessing}
            className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {isProcessing ? 'Processing...' : 'Upload PDF'}
          </button>
          <button
            onClick={handleAnalyzeClick}
            disabled={!documents.trim()}
            className="flex-1 py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
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
