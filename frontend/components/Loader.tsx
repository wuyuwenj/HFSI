import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  total?: number;
}

const Loader: React.FC<LoaderProps> = ({
  message = "Analyzing Case Documents...",
  subMessage = "This may take a moment.",
  progress = 0,
  total = 0
}) => {
  const showProgress = total > 1;
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-brand-light font-semibold">{message}</p>
      <p className="mt-2 text-sm text-gray-400">{subMessage}</p>

      {showProgress && (
        <div className="mt-6 w-80">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Processing cases: {progress}/{total}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-brand-secondary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
