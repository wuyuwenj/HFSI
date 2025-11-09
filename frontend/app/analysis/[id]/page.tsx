'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { getAnalysisById, type AnalysisRecord } from '@/lib/analysisStorage';

const AnalysisDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const data = getAnalysisById(id);

    if (!data) {
      // Analysis not found, redirect to home
      router.push('/');
      return;
    }

    setRecord(data);
    setLoading(false);
  }, [params.id, router]);

  const handleBackToOverview = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!record) {
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
              Back to Overview
            </button>
            <h1 className="text-3xl font-bold text-white">{record.caseName}</h1>
            <p className="text-gray-400 text-sm mt-1">
              Created: {new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <Dashboard analysis={record.analysis} onReset={handleBackToOverview} />
    </div>
  );
};

export default AnalysisDetailPage;
