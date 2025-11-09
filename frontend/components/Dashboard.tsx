import React from 'react';
import type { CaseAnalysis } from '@/types';
import CriticalAlerts from '@/components/CriticalAlerts';
import EvidenceTimeline from '@/components/EvidenceTimeline';
import InconsistencyFinder from '@/components/InconsistencyFinder';
import ConfidenceMatrix from '@/components/ConfidenceMatrix';
import RiskScore from '@/components/RiskScore';
import PrecedentCases from '@/components/PrecedentCases';

interface DashboardProps {
  analysis: CaseAnalysis;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, onReset }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-white">Evidex Analysis Dashboard</h1>
          <p className="text-blue-300">Case Analysis Complete</p>
        </div>
        <button
          onClick={onReset}
          className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
        >
          New Analysis
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Case Summary</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Person</h3>
                <p className="text-gray-300">{analysis.personName}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Crime Convicted Of</h3>
                <p className="text-gray-300">{analysis.crimeConvicted}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Innocence Claim</h3>
                <p className="text-gray-300">{analysis.innocenceClaim}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Parole Board Focus</h3>
                <p className="text-gray-300">{analysis.paroleBoardFocus}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-300 mb-1">Overall Summary</h3>
                <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
              </div>

              {analysis.keyQuotes && analysis.keyQuotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Key Quotes</h3>
                  <div className="space-y-3">
                    {analysis.keyQuotes.map((quote, index) => (
                      <div key={index} className="bg-slate-800 p-3 rounded border-l-4 border-blue-500">
                        <p className="text-gray-200 italic mb-2">&quot;{quote.quote}&quot;</p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{quote.context}</span>
                          <span className="font-mono">Line {quote.lineNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <CriticalAlerts alerts={analysis.criticalAlerts} />
          <EvidenceTimeline events={analysis.timelineEvents} />
          <InconsistencyFinder inconsistencies={analysis.inconsistencies} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <RiskScore score={analysis.riskScore} />
          <ConfidenceMatrix evidence={analysis.evidenceMatrix} />
          <PrecedentCases cases={analysis.precedentCases} />
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex justify-center gap-4">
        <a
          href="/dashboard"
          className="py-3 px-6 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
