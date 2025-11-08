import React from 'react';
import type { TimelineEvent } from '@/types';

const EvidenceTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-6">Evidence Timeline</h2>
      <div className="relative border-l-2 border-slate-700 ml-4">
        {events.length > 0 ? (
          // FIX: Avoid mutating props by creating a new sorted array.
          [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, index) => (
            <div key={index} className="mb-8 ml-8">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-brand-secondary rounded-full -left-4 ring-4 ring-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-white">{event.date}</h3>
              <p className="text-gray-300">{event.event}</p>
              <div className="mt-2 text-xs text-sky-400">
                Confidence: {Math.round(event.confidence * 100)}%
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 ml-8">No timeline events could be constructed from the documents.</p>
        )}
      </div>
    </div>
  );
};

export default EvidenceTimeline;
