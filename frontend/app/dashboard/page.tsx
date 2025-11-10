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
  const [newAnalysisIds, setNewAnalysisIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Clear any stale localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('verijudex_analyses');
      localStorage.removeItem('evidex_new_records');
      localStorage.removeItem('evidex_seen_records');
    }
    loadAnalyses();
    cleanupExpiredNewTags();
  }, []);

  // Check for expired new tags every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredNewTags();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const cleanupExpiredNewTags = () => {
    if (typeof window === 'undefined') return;

    const storedNew = localStorage.getItem('evidex_new_analyses');
    if (!storedNew) return;

    const newAnalyses = JSON.parse(storedNew);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    let hasChanges = false;

    // Remove expired entries
    Object.keys(newAnalyses).forEach(id => {
      if (now - newAnalyses[id] > fiveMinutes) {
        delete newAnalyses[id];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem('evidex_new_analyses', JSON.stringify(newAnalyses));
    }

    setNewAnalysisIds(new Set(Object.keys(newAnalyses)));
  };

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyses');
      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }
      const data = await response.json();
      setAnalyses(data);

      // Check for new tags
      cleanupExpiredNewTags();
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

        // Update state to remove the deleted item
        setAnalyses(analyses.filter(a => a.id !== id));
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

  const isNewAnalysis = (recordId: string): boolean => {
    return newAnalysisIds.has(recordId);
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
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Evidex</h1>
              <p className="text-lg text-blue-300 mt-2">Case Analysis Dashboard</p>
            </div>
            <nav className="hidden md:flex items-center gap-4 mt-4">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="/transcribe" className="text-gray-300 hover:text-white transition-colors">Transcribe</a>
            </nav>
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
          <div className="bg-slate-800 rounded-lg shadow-2xl overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-slate-700">
                <tr>
                  <SortableHeader column="caseName">
                    <div className="w-[300px]">Case Name</div>
                  </SortableHeader>
                  <SortableHeader column="date">
                    <div className="w-[150px]">Date</div>
                  </SortableHeader>
                  <SortableHeader column="score">
                    <div className="w-[100px]">Score</div>
                  </SortableHeader>
                  <SortableHeader column="assessment">
                    <div className="w-[150px]">Assessment</div>
                  </SortableHeader>
                  <th className="w-[120px] px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-2 max-w-[300px]">
                        <div className="truncate flex-1" title={record.caseName}>
                          {record.caseName}
                        </div>
                        {isNewAnalysis(record.id) && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full uppercase animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="space-y-1">
                        <div>{new Date(record.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(record.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${getInnocenceColor(record.riskScore)}`}>
                      {record.riskScore}/100
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${getInnocenceColor(record.riskScore)}`}>
                      {getInnocenceLevel(record.riskScore)}
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(e, record.id);
                        }}
                        className="inline-flex items-center justify-center text-red-500 hover:text-red-400 transition-all duration-150 px-3 py-1.5 rounded-md border border-red-500/30 hover:bg-red-900/20 hover:border-red-500/50 font-medium text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1">Delete</span>
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
