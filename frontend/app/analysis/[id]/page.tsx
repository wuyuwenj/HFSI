'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import type { CaseAnalysis } from '@/types';

interface AnalysisWithDetails {
  id: string;
  caseName: string;
  createdAt: string;
  analysis: CaseAnalysis;
}

const AnalysisDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [caseName, setCaseName] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const id = params.id as string;
        const response = await fetch(`/api/analyses/${id}`);

        if (!response.ok) {
          // Analysis not found, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        const data = await response.json();

        // Transform database format to CaseAnalysis format
        const analysisData: CaseAnalysis = {
          summary: data.summary,
          personName: data.personName,
          crimeConvicted: data.crimeConvicted,
          innocenceClaim: data.innocenceClaim,
          paroleBoardFocus: data.paroleBoardFocus,
          keyQuotes: data.keyQuotes,
          timelineEvents: data.timelineEvents,
          inconsistencies: data.inconsistencies,
          evidenceMatrix: data.evidenceItems,
          riskScore: data.riskScore,
          precedentCases: data.precedentCases,
          criticalAlerts: data.criticalAlerts,
        };

        setAnalysis(analysisData);
        setCaseName(data.caseName);
        setCreatedAt(data.createdAt);
        setLoading(false);
      } catch (error) {
        console.error('Error loading analysis:', error);
        router.push('/dashboard');
      }
    };

    loadAnalysis();
  }, [params.id, router]);

  const handleBackToOverview = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!analysis) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header with case name and back button */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToOverview}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-2 transition duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">{caseName}</h1>
            <p className="text-gray-400 text-sm mt-1">
              Created: {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Dashboard analysis={analysis} onReset={handleBackToOverview} />
    </div>
  );
};

export default AnalysisDetailPage;
