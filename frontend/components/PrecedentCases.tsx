import React from 'react';
import type { PrecedentCase } from '@/types';

const PrecedentCases: React.FC<{ cases: PrecedentCase[] }> = ({ cases }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Precedent Matching</h2>
      <div className="space-y-4">
        {cases.length > 0 ? (
          cases.map((pCase, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-md">
              <h3 className="font-bold text-blue-300">{pCase.caseName}</h3>
              <p className="text-sm text-gray-300 mt-1">{pCase.summary}</p>
              <p className="text-xs text-gray-400 mt-2"><strong>Outcome:</strong> {pCase.outcome}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No relevant precedent cases found.</p>
        )}
      </div>
    </div>
  );
};

export default PrecedentCases;
