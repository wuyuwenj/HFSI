import React from 'react';

const RiskScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceLevel = () => {
    if (score >= 85) return 'Extremely high likelihood';
    if (score >= 70) return 'Strong indicators';
    if (score >= 55) return 'Significant doubt';
    if (score >= 40) return 'Mixed evidence';
    if (score >= 25) return 'Leans toward guilt';
    return 'Strong guilt evidence';
  };

  const getConfidenceColor = () => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  // Calculate percentages for the gauge segments
  const reliablePercent = Math.min(score * 0.85, 100);
  const neutralPercent = 10;
  const contradictionsPercent = Math.max(100 - score, 15);

  // Normalize to 100%
  const total = reliablePercent + neutralPercent + contradictionsPercent;
  const normalizedReliable = Math.round((reliablePercent / total) * 100);
  const normalizedNeutral = Math.round((neutralPercent / total) * 100);
  const normalizedContradictions = Math.round((contradictionsPercent / total) * 100);

  // Calculate conic gradient angles (360 degrees total)
  const reliableAngle = (score / 100) * 360;
  const neutralAngle = reliableAngle + 36; // 10% of 360

  return (
    <div className="relative bg-slate-800/60 backdrop-blur rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400">Innocence Score</p>
          <p className="text-2xl font-semibold tracking-tight text-white">{score}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 ${getConfidenceColor()} text-sm`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {getConfidenceLevel()}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 rounded-full p-1 bg-slate-900/60 border border-slate-600">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  rgb(34,197,94) 0deg,
                  rgb(34,197,94) ${reliableAngle}deg,
                  rgba(45,212,191,0.5) ${reliableAngle}deg,
                  rgba(45,212,191,0.5) ${neutralAngle}deg,
                  rgba(239,68,68,0.4) ${neutralAngle}deg,
                  rgba(239,68,68,0.4) 360deg
                )`
              }}
            />
          </div>
          <div className="absolute inset-2 rounded-full bg-slate-900/90 border border-slate-600 grid place-items-center">
            <div className="text-center">
              <div className={`text-4xl font-semibold tracking-tight ${getScoreColor()} animate-pulse`}>
                {score}
              </div>
              <div className="text-xs text-gray-400">of 100</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-300">Reliable evidence</span>
            </div>
            <span className="text-sm text-gray-400">{normalizedReliable}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
              <span className="text-sm text-gray-300">Neutral</span>
            </div>
            <span className="text-sm text-gray-400">{normalizedNeutral}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-300">Contradictions</span>
            </div>
            <span className="text-sm text-gray-400">{normalizedContradictions}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
