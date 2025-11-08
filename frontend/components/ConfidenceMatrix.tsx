import React from 'react';
import type { EvidenceItem, EvidenceReliability } from '@/types';

const reliabilityStyles: Record<EvidenceReliability, string> = {
  High: 'bg-green-500 text-green-900',
  Medium: 'bg-yellow-500 text-yellow-900',
  Low: 'bg-red-500 text-red-900',
  Unverified: 'bg-gray-500 text-gray-900',
};

const ConfidenceMatrix: React.FC<{ evidence: EvidenceItem[] }> = ({ evidence }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Evidence Confidence Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-200 uppercase bg-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3">Evidence</th>
              <th scope="col" className="px-4 py-3">Reliability</th>
            </tr>
          </thead>
          <tbody>
            {evidence.length > 0 ? (
              evidence.map((item, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{item.evidence}</p>
                    <p className="text-xs text-gray-400">{item.type} - {item.notes}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 font-semibold rounded-full text-xs ${reliabilityStyles[item.reliability]}`}>
                      {item.reliability}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-400">No evidence items to display.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfidenceMatrix;
