'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisListItem {
  id: string;
  caseName: string;
  personName: string;
  riskScore: number;
  createdAt: string;
}

type SortColumn = 'caseName' | 'date' | 'score' | 'assessment';
type SortDirection = 'asc' | 'desc';

const OverviewDashboard: React.FC = () => {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyses');
      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }
      const data = await response.json();
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedAnalyses = () => {
    const sorted = [...analyses].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'caseName':
          aValue = a.caseName.toLowerCase();
          bValue = b.caseName.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'score':
        case 'assessment':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleRowClick = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent row click
    if (confirm('Are you sure you want to delete this analysis?')) {
      try {
        const response = await fetch(`/api/analyses/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete analysis');
        }
        loadAnalyses();
      } catch (error) {
        console.error('Error deleting analysis:', error);
        alert('Failed to delete analysis');
      }
    }
  };

  const getInnocenceColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getInnocenceLevel = (score: number) => {
    if (score >= 70) return 'Likely Innocent';
    if (score >= 40) return 'Uncertain';
    return 'Likely Guilty';
  };

  const SortableHeader: React.FC<{ column: SortColumn; children: React.ReactNode }> = ({ column, children }) => {
    const isActive = sortColumn === column;
    return (
      <th
        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600 transition duration-150"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-2">
          {children}
          <div className="flex flex-col">
            <svg
              className={`h-3 w-3 ${isActive && sortDirection === 'asc' ? 'text-blue-400' : 'text-gray-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" />
            </svg>
            <svg
              className={`h-3 w-3 -mt-1 ${isActive && sortDirection === 'desc' ? 'text-blue-400' : 'text-gray-500'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        </div>
      </th>
    );
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
        {loading ? (
          <div className="bg-slate-800 rounded-lg shadow-2xl p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
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
                  <SortableHeader column="caseName">Case Name</SortableHeader>
                  <SortableHeader column="date">Date</SortableHeader>
                  <SortableHeader column="score">Innocence Score</SortableHeader>
                  <SortableHeader column="assessment">Assessment</SortableHeader>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {getSortedAnalyses().map((record) => (
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
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getInnocenceColor(record.riskScore)}`}>
                      {record.riskScore}/100
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getInnocenceColor(record.riskScore)}`}>
                      {getInnocenceLevel(record.riskScore)}
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
