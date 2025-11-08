import React from 'react';
import type { Inconsistency } from '@/types';

const InconsistencyFinder: React.FC<{ inconsistencies: Inconsistency[] }> = ({ inconsistencies }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Inconsistency Finder</h2>
      <div className="space-y-6">
        {inconsistencies.length > 0 ? (
          inconsistencies.map((item, index) => (
            <div key={index} className="border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="font-semibold text-blue-300 text-sm">{item.source1}</p>
                  <p className="text-gray-200 mt-1">"{item.statement1}"</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="font-semibold text-blue-300 text-sm">{item.source2}</p>
                  <p className="text-gray-200 mt-1">"{item.statement2}"</p>
                </div>
              </div>
              <div className="mt-4 bg-amber-900/30 p-3 rounded-md border-l-4 border-amber-500">
                <p className="font-bold text-amber-300 text-sm">AI Analysis</p>
                <p className="text-gray-300 mt-1">{item.analysis}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No direct inconsistencies found in the provided documents.</p>
        )}
      </div>
    </div>
  );
};

export default InconsistencyFinder;
