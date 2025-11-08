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
          <h1 className="text-3xl font-bold text-white">VeriJudex Analysis Dashboard</h1>
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
            <h2 className="text-xl font-bold text-white mb-3">Case Summary</h2>
            <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
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
    </div>
  );
};

export default Dashboard;
