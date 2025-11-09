import React from 'react';
import type { CriticalAlert, AlertSeverity } from '@/types';

// Alert severity icons mapping
const getAlertIcon = (severity: AlertSeverity): React.ReactNode => {
  switch (severity) {
    case 'High':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'Medium':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'Low':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const CriticalAlerts: React.FC<{ alerts: CriticalAlert[] }> = ({ alerts }) => {
  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Critical Alerts</h2>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="text-sm text-gray-400 bg-slate-700/50 px-2 py-1 rounded-full">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-3 rounded-md border border-slate-600 bg-slate-800/50 p-3">
              {getAlertIcon(alert.severity)}
              <div className="flex-1">
                <p className="text-sm text-gray-100 font-semibold">{alert.title}</p>
                <p className="text-sm text-gray-300 mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">No critical alerts identified</p>
        </div>
      )}
    </div>
  );
};

export default CriticalAlerts;
