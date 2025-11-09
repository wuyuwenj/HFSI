'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DocumentInput from '@/components/DocumentInput';
import Loader from '@/components/Loader';
import { saveAnalysis } from '@/lib/analysisStorage';
import type { CaseAnalysis } from '@/types';

const AnalyzePage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Analyzing Case Documents...");
  const [loadingSubMessage, setLoadingSubMessage] = useState<string>("This may take a moment.");

  const handleAnalyze = useCallback(async (documents: string, pdfFiles?: File[], audioFiles?: File[]) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage("Analyzing Case Documents...");
    setLoadingSubMessage("Detecting cases and analyzing content...");

    try {
      // Create FormData to handle text, PDF files, and audio files
      const formData = new FormData();
      formData.append('documents', documents);

      if (pdfFiles && pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          formData.append('pdfFiles', file);
        });
      }

      if (audioFiles && audioFiles.length > 0) {
        audioFiles.forEach((file) => {
          formData.append('audioFiles', file);
        });
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis from server.');
      }

      const result = await response.json();

      // Check if this is a bulk analysis (multiple people detected)
      if (result.bulk && result.results) {
        // Multiple people detected - save all analyses
        console.log(`Bulk analysis detected: ${result.results.length} cases`);
        setLoadingMessage(`Processing ${result.results.length} cases...`);
        setLoadingSubMessage("Saving all analyses...");

        for (const caseResult of result.results) {
          saveAnalysis(caseResult.caseName, caseResult.analysis);
        }

        // Show success message and redirect
        alert(`Successfully analyzed ${result.results.length} cases! Redirecting to overview...`);
        router.push('/');
      } else if (result.analysis) {
        // Single person - use person's name from analysis
        const caseName = result.analysis.personName || 'Unknown Case';

        // Save analysis and redirect to full view
        const id = saveAnalysis(caseName, result.analysis);
        router.push(`/analysis/${id}`);
      } else {
        throw new Error('Invalid response format from server.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleReset = () => {
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} subMessage={loadingSubMessage} />;
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4 text-center">
          <h2 className="text-2xl text-red-500">Analysis Failed</h2>
          <p className="text-gray-300 mt-2 mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="py-2 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 transition duration-200"
          >
            Try Again
          </button>
        </div>
      );
    }

    return <DocumentInput onAnalyze={handleAnalyze} />;
  };

  return <>{renderContent()}</>;
};

export default AnalyzePage;
