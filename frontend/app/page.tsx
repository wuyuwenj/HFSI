'use client';

import React, { useState, useCallback } from 'react';
import DocumentInput from '@/components/DocumentInput';
import Dashboard from '@/components/Dashboard';
import Loader from '@/components/Loader';
import type { CaseAnalysis } from '@/types';

const HomePage: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<CaseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (documents: string) => {
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
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
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

    if (analysisResult) {
      return <Dashboard analysis={analysisResult} onReset={handleReset} />;
    }

    return <DocumentInput onAnalyze={handleAnalyze} />;
  };

  return <>{renderContent()}</>;
};

export default HomePage;
