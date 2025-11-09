'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllAnalyses, deleteAnalysis, type AnalysisRecord } from '@/lib/analysisStorage';

const OverviewDashboard: React.FC = () => {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    const data = getAllAnalyses();
    setAnalyses(data);
  };

  const handleRowClick = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    if (confirm('Are you sure you want to delete this analysis?')) {
      deleteAnalysis(id);
      loadAnalyses();
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="min-h-screen bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">VeriJudex</h1>
            <p className="text-lg text-blue-300 mt-2">Case Analysis Overview</p>
          </div>
          <button
            onClick={() => router.push('/analyze')}
            className="py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 transition duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Analysis
          </button>
        </div>

        {/* Analysis List */}
        {analyses.length === 0 ? (
          <div className="bg-slate-800 rounded-lg shadow-2xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">No Analyses Yet</h2>
            <p className="text-gray-400 mb-6">Get started by creating your first case analysis</p>
            <button
              onClick={() => router.push('/analyze')}
              className="py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 transition duration-200"
            >
              Create New Analysis
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Case Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {analyses.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => handleRowClick(record.id)}
                    className="hover:bg-slate-700 cursor-pointer transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {record.caseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getRiskColor(record.riskScore)}`}>
                      {record.riskScore}/100
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getRiskColor(record.riskScore)}`}>
                      {getRiskLevel(record.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => handleDelete(e, record.id)}
                        className="text-red-400 hover:text-red-300 transition duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewDashboard;
