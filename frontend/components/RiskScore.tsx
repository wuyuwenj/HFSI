import React from 'react';

const RiskScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = () => {
    if (score > 75) return 'text-red-500';
    if (score > 50) return 'text-amber-500';
    return 'text-green-500';
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-brand-dark p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-white mb-4">Wrongful Conviction Risk</h2>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-slate-700"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className={getScoreColor()}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transition: 'stroke-dashoffset 0.5s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
          <span className={`text-xl font-bold ${getScoreColor()}`}>%</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
