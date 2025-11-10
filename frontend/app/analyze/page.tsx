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

  const handleAnalyze = useCallback(async (documents: string, pdfFiles?: File[], audioFiles?: File[], mode?: 'detailed' | 'bulk') => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setTotalCases(0);
    setLoadingMessage("Analyzing case documents...");
    setLoadingSubMessage("Processing uploaded documents...");

    try {
      // Determine the mode based on whether we have multiple files or single case
      const isBulkMode = mode === 'bulk' || (pdfFiles && pdfFiles.length > 1 && !documents && (!audioFiles || audioFiles.length === 0));

      if (isBulkMode) {
        // Bulk mode - use the bulk analyze endpoint with streaming
        setLoadingMessage("Processing bulk analysis...");
        setLoadingSubMessage("Detecting and analyzing multiple cases...");

        const formData = new FormData();
        formData.append('documents', documents);
        formData.append('mode', 'bulk');

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
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error('Failed to analyze cases: ' + errorText);
        }

        // Check if we got a streaming response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/x-ndjson')) {
          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let finalResult: any = null;

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const data = JSON.parse(line);

                    if (data.type === 'progress') {
                      setProgress(data.current);
                      setTotalCases(data.total);
                      setLoadingMessage(data.message || 'Processing...');
                      setLoadingSubMessage(
                        data.caseName
                          ? `Case ${data.current + 1} of ${data.total}: ${data.caseName}`
                          : `Processing case ${data.current} of ${data.total}`
                      );
                    } else if (data.type === 'complete') {
                      finalResult = data;
                    } else if (data.type === 'error') {
                      throw new Error(data.error || 'Analysis failed');
                    }
                  } catch (e) {
                    console.error('Error parsing stream:', e);
                  }
                }
              }
            }
          }

          if (finalResult && finalResult.bulk && finalResult.analyses) {
            // Multiple cases were analyzed
            setLoadingMessage("Complete!");
            setLoadingSubMessage(`Successfully analyzed ${finalResult.count} cases`);

            // Mark new analyses in localStorage
            const newAnalyses: Record<string, number> = {};
            const now = Date.now();
            finalResult.analyses.forEach((analysis: any) => {
              if (analysis.id) {
                newAnalyses[analysis.id] = now;
              }
            });

            // Get existing new analyses and merge
            const existingNew = localStorage.getItem('evidex_new_analyses');
            const existing = existingNew ? JSON.parse(existingNew) : {};
            const merged = { ...existing, ...newAnalyses };
            localStorage.setItem('evidex_new_analyses', JSON.stringify(merged));

            setTimeout(() => {
              alert(`Successfully analyzed ${finalResult.count} cases! Redirecting to dashboard...`);
              window.location.href = '/dashboard';
            }, 500);
          } else {
            throw new Error('Invalid response format from server.');
          }
        } else {
          // Non-streaming response (single case or old format)
          const result = await response.json();

          if (result.bulk && result.analyses) {
            setLoadingMessage("Complete!");
            setLoadingSubMessage(`Successfully analyzed ${result.count} cases`);

            // Mark new analyses in localStorage
            const newAnalyses: Record<string, number> = {};
            const now = Date.now();
            result.analyses.forEach((analysis: any) => {
              if (analysis.id) {
                newAnalyses[analysis.id] = now;
              }
            });

            // Get existing new analyses and merge
            const existingNew = localStorage.getItem('evidex_new_analyses');
            const existing = existingNew ? JSON.parse(existingNew) : {};
            const merged = { ...existing, ...newAnalyses };
            localStorage.setItem('evidex_new_analyses', JSON.stringify(merged));

            setTimeout(() => {
              alert(`Successfully analyzed ${result.count} cases! Redirecting to dashboard...`);
              window.location.href = '/dashboard';
            }, 500);
          } else if (result.id) {
            // Mark single analysis as new
            const now = Date.now();
            const existingNew = localStorage.getItem('evidex_new_analyses');
            const existing = existingNew ? JSON.parse(existingNew) : {};
            existing[result.id] = now;
            localStorage.setItem('evidex_new_analyses', JSON.stringify(existing));

            router.push(`/analysis/${result.id}`);
          } else {
            throw new Error('Invalid response format from server.');
          }
        }
      } else {
        // Single person mode - analyze normally
        setLoadingMessage("Analyzing case...");
        setLoadingSubMessage("Processing documents...");

        const formData = new FormData();
        formData.append('documents', documents);
        formData.append('mode', 'single');

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

        const response = await fetch('/api/analyze-single', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze case');
        }

        const result = await response.json();

        if (result.id) {
          // Mark single analysis as new
          const now = Date.now();
          const existingNew = localStorage.getItem('evidex_new_analyses');
          const existing = existingNew ? JSON.parse(existingNew) : {};
          existing[result.id] = now;
          localStorage.setItem('evidex_new_analyses', JSON.stringify(existing));

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
