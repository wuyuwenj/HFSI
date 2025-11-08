import React from 'react';
import type { CriticalAlert, AlertSeverity } from '@/types';

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
const severityStyles: Record<AlertSeverity, { bg: string; icon: React.ReactNode }> = {
  High: {
    bg: 'bg-red-900/50 border-red-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  Medium: {
    bg: 'bg-amber-900/50 border-amber-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  Low: {
    bg: 'bg-sky-900/50 border-sky-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
      </svg>
    ),
  },
};

const CriticalAlerts: React.FC<{ alerts: CriticalAlert[] }> = ({ alerts }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Critical Alerts</h2>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div key={index} className={`flex items-start p-4 rounded-md border-l-4 ${severityStyles[alert.severity].bg}`}>
              <div className="flex-shrink-0 mr-4">{severityStyles[alert.severity].icon}</div>
              <div>
                <h3 className="font-bold text-gray-100">{alert.title}</h3>
                <p className="text-gray-300">{alert.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No critical alerts identified.</p>
        )}
      </div>
    </div>
  );
};

export default CriticalAlerts;
