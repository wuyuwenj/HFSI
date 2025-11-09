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

  const handleAnalyze = useCallback(async (documents: string) => {
    // Prompt for case name
    const caseName = prompt('Enter a name for this case:');
    if (!caseName || !caseName.trim()) {
      alert('Case name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis from server.');
      }

      const result: CaseAnalysis = await response.json();

      // Save analysis and redirect to full view
      const id = saveAnalysis(caseName.trim(), result);
      router.push(`/analysis/${id}`);
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
      return <Loader />;
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
