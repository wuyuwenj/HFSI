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
  const [progress, setProgress] = useState<number>(0);
  const [totalCases, setTotalCases] = useState<number>(0);

  const handleAnalyze = useCallback(async (documents: string, pdfFiles?: File[], audioFiles?: File[]) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setTotalCases(0);
    setLoadingMessage("Detecting cases...");
    setLoadingSubMessage("Analyzing uploaded documents...");

    try {
      // Step 1: Detect if there are multiple people
      const detectFormData = new FormData();
      detectFormData.append('documents', documents);

      if (pdfFiles && pdfFiles.length > 0) {
        pdfFiles.forEach((file) => {
          detectFormData.append('pdfFiles', file);
        });
      }

      const detectResponse = await fetch('/api/detect', {
        method: 'POST',
        body: detectFormData,
      });

      if (!detectResponse.ok) {
        throw new Error('Failed to detect cases');
      }

      const detection = await detectResponse.json();

      // Step 2: Check if multiple people detected
      if (detection.multiplePeople && detection.people.length > 1) {
        // Multiple people detected - analyze each one separately with progress tracking
        const peopleCount = detection.people.length;
        setTotalCases(peopleCount);
        setLoadingMessage(`Analyzing ${peopleCount} cases...`);
        setLoadingSubMessage("Processing each case individually...");

        const analysisIds: string[] = [];

        for (let i = 0; i < detection.people.length; i++) {
          const person = detection.people[i];
          setLoadingSubMessage(`Analyzing case ${i + 1} of ${peopleCount}: ${person.name}`);

          // Create FormData for this specific person's files
          const personFormData = new FormData();
          personFormData.append('documents', documents);

          // Add only the files that belong to this person
          if (pdfFiles && pdfFiles.length > 0) {
            person.fileIndices.forEach((fileIndex: number) => {
              if (fileIndex < pdfFiles.length) {
                personFormData.append('pdfFiles', pdfFiles[fileIndex]);
              }
            });
          }

          if (audioFiles && audioFiles.length > 0) {
            person.fileIndices.forEach((fileIndex: number) => {
              const audioIndex = fileIndex - (pdfFiles?.length || 0);
              if (audioIndex >= 0 && audioIndex < audioFiles.length) {
                personFormData.append('audioFiles', audioFiles[audioIndex]);
              }
            });
          }

          // Analyze this person's case
          console.log(`Analyzing person ${i + 1}/${peopleCount}: ${person.name}`);
          const analyzeResponse = await fetch('/api/analyze-single', {
            method: 'POST',
            body: personFormData,
          });

          if (!analyzeResponse.ok) {
            const errorData = await analyzeResponse.json();
            console.error(`Failed to analyze ${person.name}:`, errorData);
            throw new Error(`Failed to analyze case for ${person.name}: ${errorData.error || 'Unknown error'}`);
          }

          const analyzeResult = await analyzeResponse.json();
          console.log(`Successfully analyzed ${person.name}, ID: ${analyzeResult.id}`);
          analysisIds.push(analyzeResult.id);

          // Update progress
          setProgress(i + 1);
        }

        // All cases analyzed - redirect to overview
        setLoadingMessage("Complete!");
        setLoadingSubMessage(`Successfully analyzed ${peopleCount} cases`);

        setTimeout(() => {
          alert(`Successfully analyzed ${peopleCount} cases! Redirecting to overview...`);
          window.location.href = '/'; // Full page reload to show new data
        }, 500);
      } else {
        // Single person - analyze normally
        setLoadingMessage("Analyzing case...");
        setLoadingSubMessage("Processing documents...");

        const analyzeFormData = new FormData();
        analyzeFormData.append('documents', documents);

        if (pdfFiles && pdfFiles.length > 0) {
          pdfFiles.forEach((file) => {
            analyzeFormData.append('pdfFiles', file);
          });
        }

        if (audioFiles && audioFiles.length > 0) {
          audioFiles.forEach((file) => {
            analyzeFormData.append('audioFiles', file);
          });
        }

        const analyzeResponse = await fetch('/api/analyze-single', {
          method: 'POST',
          body: analyzeFormData,
        });

        if (!analyzeResponse.ok) {
          const errorData = await analyzeResponse.json();
          throw new Error(errorData.error || 'Failed to analyze case');
        }

        const result = await analyzeResponse.json();

        if (result.id) {
          router.push(`/analysis/${result.id}`);
        } else {
          throw new Error('Invalid response format from server.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setTotalCases(0);
    }
  }, [router]);

  const handleReset = () => {
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} subMessage={loadingSubMessage} progress={progress} total={totalCases} />;
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
